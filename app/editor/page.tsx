// app/editor/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import CVDiffViewer from '@/components/CVDiffViewer'
import { RichTextEditorRef } from '@/components/RichTextEditor'

// Dynamically load the editor (client-side only).
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
})

export default function EditorPage() {
  const [originalText, setOriginalText] = useState('')
  const [anonymizedText, setAnonymizedText] = useState('')
  const [finalText, setFinalText] = useState('') // Current live editor content.
  const [formattedCV, setFormattedCV] = useState('') // Newly formatted CV from API.
  const [userInstructions, setUserInstructions] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])

  // Loading states for actions.
  const [anonymizeLoading, setAnonymizeLoading] = useState(false)
  const [reformatLoading, setReformatLoading] = useState(false)
  const [agentLoading, setAgentLoading] = useState(false)

  // Reference to the RichTextEditor.
  const editorRef = useRef<RichTextEditorRef>(null)

  // Load the parsed CV from localStorage on mount.
  useEffect(() => {
    const parsed = localStorage.getItem('parsedCV')
    if (parsed) {
      setOriginalText(parsed)
    }
  }, [])

  // Step 1: Anonymize.
  const handleAnonymize = async () => {
    setAnonymizeLoading(true)
    try {
      const res = await fetch('/api/anonymize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText }),
      })
      const data = await res.json()
      setAnonymizedText(data.anonymized || '')
    } catch (error) {
      console.error(error)
    } finally {
      setAnonymizeLoading(false)
    }
  }

  // Step 2: Format (AI-powered reformatting).
  const handleReformat = async () => {
    setReformatLoading(true)
    try {
      const res = await fetch('/api/reformat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: anonymizedText }),
      })
      const data = await res.json()
      console.log('Reformat response:', data)
      setFormattedCV(data.formatted || '')
    } catch (error) {
      console.error(error)
    } finally {
      setReformatLoading(false)
    }
  }

  // When the user clicks "Load Formatted CV", update the editor.
  const loadFormattedCV = () => {
    if (editorRef.current && formattedCV) {
      editorRef.current.updateContent(formattedCV)
      setFinalText(formattedCV)
    }
  }

  // Step 3: Agentic AI Suggestions (optional refinement).
  const handleAgenticAI = async () => {
    setAgentLoading(true)
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCV: finalText,
          userInstructions,
        }),
      })
      const data = await res.json()
      if (data.error) {
        console.error(data.error)
        setAiSuggestions([
          { summary: 'Error fetching suggestions', modifiedCV: finalText },
        ])
      } else {
        setAiSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error(error)
      setAiSuggestions([
        { summary: 'Unable to fetch suggestions', modifiedCV: finalText },
      ])
    } finally {
      setAgentLoading(false)
    }
  }

  // Accept a suggestion by replacing the current CV with the modified version,
  // and then remove only that suggestion from the list.
  const applySuggestion = (index: number) => {
    const suggestion = aiSuggestions[index]
    if (!suggestion) return
    if (editorRef.current && suggestion.modifiedCV) {
      editorRef.current.updateContent(suggestion.modifiedCV)
      setFinalText(suggestion.modifiedCV)
      // Remove only the applied suggestion.
      setAiSuggestions((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // New: Download the formatted CV as a PDF using the Puppeteer API.
  const downloadCVAsPDF = async () => {
    // Select the container that holds the formatted CV.
    const element = document.querySelector('.cv-content')
    if (!element) return
    // Get the outer HTML of the container.
    const html = element.outerHTML

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })
      if (!res.ok) {
        console.error('PDF generation failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'formatted_cv.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center">Editor</h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleAnonymize}
            disabled={anonymizeLoading}
            variant="outline"
          >
            {anonymizeLoading ? 'Anonymizing...' : 'Anonymize CV'}
          </Button>
          <Button
            onClick={handleReformat}
            disabled={!anonymizedText || reformatLoading}
          >
            {reformatLoading ? 'Formatting...' : 'Format CV'}
          </Button>
          {formattedCV && (
            <Button onClick={loadFormattedCV}>Load Formatted CV</Button>
          )}
          {(finalText || formattedCV) && (
            <Button onClick={downloadCVAsPDF} variant="outline">
              Download PDF
            </Button>
          )}
        </div>

        {/* Agentic AI Section */}
        <Card>
          <CardHeader>
            <CardTitle>Agentic AI: Refine Further</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g. Remove work history, change 'Work History' to 'Experience'..."
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              className="w-full resize-none"
            />
            <Button
              onClick={handleAgenticAI}
              disabled={!finalText || agentLoading}
            >
              {agentLoading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
            </Button>

            {Array.isArray(aiSuggestions) && aiSuggestions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold">Suggestions</h4>
                {aiSuggestions.map((sugg, idx) => (
                  <Card key={idx} className="border">
                    <CardContent className="p-4">
                      <p className="font-medium">
                        <strong>Summary:</strong> {sugg.summary}
                      </p>
                      {/* Show a diff view comparing the current CV to the suggested modified version */}
                      <div className="mt-2">
                        <CVDiffViewer
                          oldText={finalText}
                          newText={sugg.modifiedCV}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => applySuggestion(idx)}
                        className="mt-2"
                      >
                        Apply Suggestion
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-Column Layout for Text Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anonymized Text Display */}
          <Card>
            <CardHeader>
              <CardTitle>Anonymized Text</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-100 rounded text-gray-800 min-h-[200px] overflow-auto whitespace-pre-wrap">
                {anonymizedText}
              </pre>
            </CardContent>
          </Card>

          {/* Formatted CV with Rich Text Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Formatted CV (Editable)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Wrap the editor in a container with a class for PDF capture */}
              <div className="cv-content">
                <RichTextEditor
                  ref={editorRef}
                  initialValue={finalText || formattedCV}
                  onChange={(val) => setFinalText(val)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

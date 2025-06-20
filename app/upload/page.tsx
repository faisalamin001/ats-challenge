'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UploadComponent() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to parse file.')
      }

      const data = await res.json()
      const text = data.text || ''

      // Store the parsed CV text in localStorage for later use.
      localStorage.setItem('parsedCV', text)

      router.push('/editor')
    } catch (error) {
      console.error(error)
      alert('Error parsing file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-center text-2xl font-semibold">
            Anonymize, reformat, and refine <br /> your CV using AI.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <label
              htmlFor="file-upload"
              className="mt-1 flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              {selectedFile ? (
                <span className="text-gray-700">{selectedFile.name}</span>
              ) : (
                <span className="text-gray-500">Click to select a CV file</span>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full"
          >
            {loading ? 'Parsing...' : 'Upload & Parse'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

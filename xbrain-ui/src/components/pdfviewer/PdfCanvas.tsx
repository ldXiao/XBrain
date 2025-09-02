// PdfViewer.tsx
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
// Configure pdf.js worker for Vite: import worker as URL string
// Vite's ?url returns the resolved URL string which pdfjs can use.
// eslint-disable-next-line import/no-unresolved
import baseWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'

// Build a versioned worker URL to avoid stale cache issues (notably on localhost during dev)
const workerUrl = new URL(baseWorkerSrc, typeof window !== 'undefined' ? window.location.href : 'http://localhost')
if (import.meta.env.DEV) {
  workerUrl.searchParams.set('v', String(Date.now()))
}
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.toString()

type PdfCanvasProps = { file: string | File | ArrayBuffer | Uint8Array }

export function PdfCanvas(props: PdfCanvasProps) {
  const [numPages, setNumPages] = useState<number>(0)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`Loaded a document with ${numPages} pages`)
    setNumPages(numPages)
  }

  const onDocumentLoadError = (error: unknown) => {
    console.error('Failed to load PDF:', error)
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full max-w-4xl h-[600px] overflow-y-auto rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <Document file={props.file as any} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
          {Array.from({ length: numPages }, (_, index) => (
            <Page className="mx-auto my-4" key={`page_${index + 1}`} pageNumber={index + 1} width={800} />
          ))}
        </Document>
      </div>
      {numPages > 0 && <p className="text-sm text-neutral-600 dark:text-neutral-300">Pages: {numPages}</p>}
    </div>
  )
}

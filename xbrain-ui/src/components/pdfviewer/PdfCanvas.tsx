// PdfViewer.tsx
import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

type PdfCanvasProps = { file: string | File | ArrayBuffer | Uint8Array }

export function PdfCanvas(props: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    // Clear previous render
    container.innerHTML = ''
    setError(null)
    setNumPages(0)

    // Resolve input to url or data
    const makeSource = async () => {
      if (typeof props.file === 'string') return { url: props.file }
      if (props.file instanceof Uint8Array) return { data: props.file }
      if (props.file instanceof ArrayBuffer) return { data: new Uint8Array(props.file) }
      if (props.file instanceof File) {
        const buf = await props.file.arrayBuffer()
        return { data: new Uint8Array(buf) }
      }
      return { data: undefined as unknown as Uint8Array }
    }

    const run = async () => {
      try {
        const src = await makeSource()

        // Important: make sure folder is named "standard_fonts" (not "stadard_fonts")
        const loadingTask = pdfjsLib.getDocument({
          ...src,
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
        })

        const pdf = await loadingTask.promise
        if (cancelled) return

        setNumPages(pdf.numPages)

        const deviceScale = window.devicePixelRatio || 1
        const targetWidth = container.clientWidth || 800

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          if (cancelled) return

          const vp = page.getViewport({ scale: 1 })
          const scale = targetWidth / vp.width
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Canvas 2D context not available')

          canvas.width = Math.floor(viewport.width * deviceScale)
          canvas.height = Math.floor(viewport.height * deviceScale)
          canvas.style.width = `${viewport.width}px`
          canvas.style.height = `${viewport.height}px`
          canvas.style.display = 'block'
          canvas.style.margin = '16px auto'

          container.appendChild(canvas)

          const renderTask = page.render({
            canvasContext: ctx,
            viewport,
            transform: deviceScale !== 1 ? [deviceScale, 0, 0, deviceScale, 0, 0] : undefined,
          })

          await renderTask.promise
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to render PDF')
        // eslint-disable-next-line no-console
        console.error('pdf.js render error:', e)
      }
    }

    run()

    return () => {
      cancelled = true
      container.innerHTML = ''
    }
  }, [props.file])

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div ref={containerRef} className="w-full max-w-4xl max-h-[80vh] overflow-auto rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm" />
      {numPages > 0 && <p className="text-sm text-neutral-600 dark:text-neutral-300">Pages: {numPages}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

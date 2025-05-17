import PdfViewer from "@/components/pdf-preview/pdf-viewer";

export default function Home() {
  return (
    <main className="min-h-[500px] bg-background text-foreground p-8 sm:p-16">
      <PdfViewer />
    </main>
  );
}

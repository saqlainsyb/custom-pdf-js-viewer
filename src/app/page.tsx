import PdfViewer from "@/components/pdf-preview/pdf-viewer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex justify-items-stretch">
      <section className="w-full border-2 flex-1/2">Hello There</section>
      <PdfViewer />
    </main>
  );
}

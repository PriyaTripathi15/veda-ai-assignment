export function GET() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#111827" />
      <path d="M8 22V10h3.5l4.5 6.5L20.5 10H24v12h-3V15.5l-4 5.5h-.5l-4-5.5V22H8Z" fill="#F9FAFB"/>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

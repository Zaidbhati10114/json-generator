export default function Head() {
  return (
    <>
      <title>JSON Generator | AI-Powered Mock API Builder</title>
      <meta
        name="description"
        content="Generate realistic JSON datasets instantly using AI — no signup, no credit card."
      />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const theme = localStorage.getItem('theme');
                if (!theme || theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {
                document.documentElement.classList.add('dark');
              }
            })();
          `,
        }}
      />
    </>
  );
}

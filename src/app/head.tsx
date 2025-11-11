export default function Head() {
  return (
    <>
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

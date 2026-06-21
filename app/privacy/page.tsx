import Link from "next/link";

export const metadata = {
  title: "Privacy Policy"
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <article className="mx-auto max-w-[760px]">
        <Link href="/" className="text-sm font-medium underline underline-offset-4">
          Back to home
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-neutral-600">Last updated: June 2026</p>

        <p className="mt-8 leading-7">
          Etsy Easy Post Tool is a local desktop tool that helps online sellers turn their shop product listings into optimized visual marketing posts.
        </p>

        <Section title="Information We Collect">
          <p>The app may collect or process the following information:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Shop product listing data such as product titles, descriptions, prices, images, tags, categories, and product URLs</li>
            <li>Generated marketing content such as titles, descriptions, keywords, hashtags, and post concepts</li>
            <li>Connected social account information when a user chooses to connect an account</li>
            <li>Basic performance metrics when available, such as impressions, clicks, saves, and post history</li>
          </ul>
        </Section>

        <Section title="How We Use Information">
          <p>We use this information only to provide the app&apos;s core features:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Importing product listings</li>
            <li>Generating AI-assisted marketing content</li>
            <li>Helping users review and edit generated content</li>
            <li>Publishing or scheduling approved content to a connected social account when available</li>
            <li>Showing basic performance metrics when available</li>
            <li>Improving the reliability and usability of the app</li>
          </ul>
        </Section>

        <Section title="User Control">
          <p>
            Users remain in control of all generated content. The app does not publish content without user approval. Users can edit, approve, copy, export, publish, or delete generated content.
          </p>
        </Section>

        <Section title="Data Sharing">
          <p>
            We do not sell user data. We do not share user data with third parties except when required to provide the app functionality, such as AI content generation, connected account integrations, hosting, storage, or analytics services.
          </p>
        </Section>

        <Section title="Local App Notice">
          <p>
            Etsy Easy Post Tool is designed as a local-first tool. Some data may be processed locally on the user&apos;s device. When external services are connected, only the permissions required for the requested features are used.
          </p>
        </Section>

        <Section title="Account Connections">
          <p>
            If users connect an external account, the app uses the connection only to perform actions requested by the user, such as publishing or scheduling approved content and displaying basic metrics when available. Users can disconnect their account at any time.
          </p>
        </Section>

        <Section title="Data Deletion">
          <p>Users may request deletion of their data by contacting us.</p>
        </Section>

        <Section title="Contact">
          <p>For privacy questions or data deletion requests, contact:</p>
          <p className="mt-2 font-medium">avena0613@gmail.com</p>
        </Section>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-neutral-800">{children}</div>
    </section>
  );
}

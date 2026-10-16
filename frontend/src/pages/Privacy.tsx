import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const LAST_UPDATED = 'October 16, 2025';
const CONTACT_EMAIL = 'tripwise-privacy@vitstudent.ac.in';

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-paper-100">{title}</h2>
      <div className="text-ink-600 dark:text-forest-200 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function Privacy() {
  return (
    <motion.div {...fade} className="max-w-3xl mx-auto space-y-10 pb-16">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-forest-300 hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-forest-700 dark:bg-forest-600 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="font-serif text-4xl font-bold text-ink-900 dark:text-paper-100">Privacy Policy</h1>
          <p className="text-sm text-ink-400 dark:text-forest-400 mt-1">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <p className="text-ink-600 dark:text-forest-200 leading-relaxed border-l-4 border-accent/40 pl-4">
        TripWise is a travel-destination discovery tool built by the AWS Student Builder Group at VIT Chennai.
        We have designed it to collect as little personal data as possible. This policy explains what we do
        handle, why, and how.
      </p>

      <div className="space-y-8">
        {/* 1 & 8 – Data we collect and retention */}
        <Section title="1. What data we collect and why">
          <p>
            TripWise does <strong>not</strong> require you to create an account or provide any personal
            information such as your name, e-mail address, or payment details.
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>
              <strong>Itinerary data</strong> — When you add a destination to "My Trip", we store the
              public place identifier (xid) and a cached snapshot of publicly available destination metadata
              (name, coordinates, kind, image URL) in a PostgreSQL database. This contains no personal data.
            </li>
            <li>
              <strong>Search queries</strong> — Text you type into the search bar is sent to our backend and
              forwarded to OpenTripMap to retrieve results. We do not log or store search queries beyond the
              duration of the HTTP request.
            </li>
            <li>
              <strong>Server logs</strong> — Our web server may record standard HTTP access logs (timestamp,
              IP address, HTTP method, path, status code) for security and debugging. Logs are retained for
              no more than <strong>30 days</strong> and then deleted automatically.
            </li>
            <li>
              <strong>Theme preference</strong> — Your light/dark-mode preference is stored in your
              browser's <code>localStorage</code>. This stays on your device; we never receive it.
            </li>
          </ul>
        </Section>

        {/* 5 – Legal basis */}
        <Section title="2. Legal basis for processing (GDPR Article 6)">
          <p>Where the GDPR applies, we rely on the following legal bases:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>
              <strong>Legitimate interests (Art. 6(1)(f))</strong> — Server log processing to detect abuse,
              diagnose errors, and maintain security.
            </li>
            <li>
              <strong>Contract / service provision (Art. 6(1)(b))</strong> — Storing itinerary items is
              necessary to deliver the core feature you have requested.
            </li>
          </ul>
        </Section>

        {/* 3 – GDPR */}
        <Section title="3. GDPR compliance">
          <p>
            TripWise may be used by people in the European Economic Area (EEA). Although we collect minimal
            personal data, we observe the following rights:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong>Right of access</strong> — you may request a copy of any data we hold on you.</li>
            <li><strong>Right to rectification</strong> — you may ask us to correct inaccurate data.</li>
            <li>
              <strong>Right to erasure ("right to be forgotten")</strong> — you may request deletion of your
              data (see Section 6 below).
            </li>
            <li>
              <strong>Right to object / restrict processing</strong> — you may object to our legitimate-interest
              processing of server logs.
            </li>
            <li>
              <strong>Right to portability</strong> — upon request we can provide itinerary data in a
              machine-readable format.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
              {CONTACT_EMAIL}
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        {/* 4 – Cookies */}
        <Section title="4. Cookies and local storage">
          <p>
            TripWise does <strong>not</strong> set any cookies of its own. We do not use tracking pixels,
            analytics cookies, or advertising cookies.
          </p>
          <p>
            We load fonts from Google Fonts (fonts.googleapis.com). This is a standard CDN request; Google
            may receive your IP address and browser User-Agent as part of serving the font files. Please
            review{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google's Privacy Policy
            </a>{' '}
            for details.
          </p>
          <p>
            Your light/dark-mode preference is stored in <code>localStorage</code> — a browser-side
            key/value store that is never transmitted to our servers.
          </p>
        </Section>

        {/* 6 – Marketing */}
        <Section title="5. Marketing communications">
          <p>
            We do not send marketing e-mails, push notifications, or any promotional messages. We do not
            collect e-mail addresses or phone numbers.
          </p>
        </Section>

        {/* 7 – Data deletion */}
        <Section title="6. Data deletion requests">
          <p>
            Because TripWise does not tie itinerary data to a personal account, the practical way to delete
            your data is:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>
              Remove individual destinations from "My Trip" using the delete button on each card — this
              permanently removes the record from our database.
            </li>
            <li>
              To request deletion of any server-log records that may contain your IP address, e-mail us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                {CONTACT_EMAIL}
              </a>{' '}
              with the subject line "Data Deletion Request". We will process this within 30 days.
            </li>
          </ul>
        </Section>

        {/* 8 – Retention (also covered in Section 1 above) */}
        <Section title="7. Data retention">
          <p>
            <strong>Itinerary items</strong> — kept indefinitely until you delete them (or until the
            service is shut down).
          </p>
          <p>
            <strong>Server access logs</strong> — retained for a maximum of 30 days, then deleted.
          </p>
          <p>
            <strong>localStorage (theme)</strong> — stored on your device only; cleared when you clear
            your browser data.
          </p>
        </Section>

        {/* 9 & 10 – Third parties */}
        <Section title="8. Third-party services and data sharing">
          <p>We use the following third-party services:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-paper-300 dark:border-forest-700">
                  <th className="text-left py-2 pr-4 font-semibold text-ink-700 dark:text-paper-200">Provider</th>
                  <th className="text-left py-2 pr-4 font-semibold text-ink-700 dark:text-paper-200">Purpose</th>
                  <th className="text-left py-2 font-semibold text-ink-700 dark:text-paper-200">Data shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-forest-800">
                <tr>
                  <td className="py-2 pr-4">OpenTripMap</td>
                  <td className="py-2 pr-4">Destination search & place details</td>
                  <td className="py-2">Search query, coordinates, place IDs</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Google Fonts</td>
                  <td className="py-2 pr-4">Font delivery (CDN)</td>
                  <td className="py-2">IP address, User-Agent (browser)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We do <strong>not</strong> sell personal data. We do not share data with advertising networks,
            data brokers, or any party not listed above.
          </p>
          <p>
            We have reviewed OpenTripMap's API terms. For a full data-processing agreement (DPA) under
            GDPR Art. 28, please contact us if you operate TripWise in a context that requires one.
          </p>
        </Section>

        {/* 11 – Security */}
        <Section title="9. Data security">
          <p>We implement the following technical safeguards:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>All API traffic is served over HTTPS/TLS.</li>
            <li>
              HTTP security headers are set via <code>helmet</code> (Content-Security-Policy,
              X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.).
            </li>
            <li>Rate limiting is applied to all API endpoints (120 requests/minute per IP).</li>
            <li>Database inputs are validated and parameterised to prevent injection attacks.</li>
            <li>CORS is restricted to the known frontend origin in production.</li>
          </ul>
          <p>
            No system is perfectly secure. If you discover a security vulnerability, please disclose it
            responsibly to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        {/* 12 – Breach */}
        <Section title="10. Data breach procedure">
          <p>
            In the unlikely event of a personal data breach, we will:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 ml-2">
            <li>Contain and assess the breach within 24 hours of discovery.</li>
            <li>
              Notify the relevant supervisory authority within 72 hours if the breach is likely to result in
              a risk to individuals' rights and freedoms (GDPR Art. 33).
            </li>
            <li>
              If the breach poses a high risk, notify affected users without undue delay (GDPR Art. 34).
            </li>
            <li>Document the breach, its effects, and remedial actions taken.</li>
          </ol>
          <p>
            Given that TripWise holds no passwords, financial data, or sensitive personal categories, the
            risk profile of any breach is assessed as low.
          </p>
        </Section>

        {/* Changes */}
        <Section title="11. Changes to this policy">
          <p>
            We may update this policy from time to time. When we do, we will revise the "Last updated" date
            at the top. Continued use of TripWise after a change constitutes acceptance of the revised policy.
          </p>
        </Section>

        {/* Contact */}
        <Section title="12. Contact">
          <p>
            For any privacy-related questions or requests, write to us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <p className="text-xs text-ink-400 dark:text-forest-400">
            TripWise · AWS Student Builder Group · VIT Chennai
          </p>
        </Section>
      </div>
    </motion.div>
  );
}

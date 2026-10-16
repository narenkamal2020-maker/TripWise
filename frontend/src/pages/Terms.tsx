import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScrollText, ArrowLeft } from 'lucide-react';

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

export function Terms() {
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
          <ScrollText className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="font-serif text-4xl font-bold text-ink-900 dark:text-paper-100">Terms &amp; Conditions</h1>
          <p className="text-sm text-ink-400 dark:text-forest-400 mt-1">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <p className="text-ink-600 dark:text-forest-200 leading-relaxed border-l-4 border-accent/40 pl-4">
        These Terms &amp; Conditions ("Terms") govern your use of TripWise, a travel-destination discovery
        application provided by the AWS Student Builder Group at VIT Chennai ("we", "us", "our").
        By accessing or using TripWise you agree to these Terms. If you do not agree, please do not use
        the application.
      </p>

      <div className="space-y-8">
        {/* 1 – Use of the app */}
        <Section title="1. Use of TripWise">
          <p>TripWise is provided free of charge for personal, non-commercial use.</p>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Use the application for any unlawful purpose or in violation of any applicable law.</li>
            <li>Attempt to reverse-engineer, decompile, or tamper with the application.</li>
            <li>Abuse or overload the API (automated scraping, denial-of-service attacks, etc.).</li>
            <li>
              Attempt to gain unauthorised access to our servers, databases, or any connected system.
            </li>
          </ul>
        </Section>

        {/* 13 – IP */}
        <Section title="2. Intellectual property">
          <p>
            The TripWise application code, design, and content created by us are owned by the AWS Student
            Builder Group, VIT Chennai and are protected by applicable intellectual property laws.
          </p>
          <p>
            Place data (names, descriptions, images, coordinates) is sourced from{' '}
            <a
              href="https://opentripmap.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              OpenTripMap
            </a>{' '}
            and is licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)
            </a>
            . Attribution is given to OpenTripMap in the application footer.
          </p>
          <p>
            You may not reproduce, distribute, or create derivative works of TripWise's code or design
            without our prior written permission.
          </p>
        </Section>

        {/* 14 – Open-source licences */}
        <Section title="3. Open-source acknowledgements">
          <p>
            TripWise is built with open-source software. The key dependencies and their licences are
            listed below. Full licence texts are available in the respective package repositories.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-paper-300 dark:border-forest-700">
                  <th className="text-left py-2 pr-4 font-semibold text-ink-700 dark:text-paper-200">Package</th>
                  <th className="text-left py-2 font-semibold text-ink-700 dark:text-paper-200">Licence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-forest-800">
                {[
                  ['React', 'MIT'],
                  ['React Router', 'MIT'],
                  ['Framer Motion', 'MIT'],
                  ['Three.js / @react-three/fiber / drei', 'MIT'],
                  ['Lucide React', 'ISC'],
                  ['Tailwind CSS', 'MIT'],
                  ['Vite', 'MIT'],
                  ['Express', 'MIT'],
                  ['Helmet', 'MIT'],
                  ['express-rate-limit', 'MIT'],
                  ['pg (node-postgres)', 'MIT'],
                  ['Axios', 'MIT'],
                  ['Zod', 'MIT'],
                  ['TypeScript', 'Apache-2.0'],
                  ['Google Fonts (Playfair Display, Inter)', 'OFL-1.1 / Apache-2.0'],
                ].map(([pkg, lic]) => (
                  <tr key={pkg}>
                    <td className="py-2 pr-4">{pkg}</td>
                    <td className="py-2 text-ink-500 dark:text-forest-300">{lic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            None of the dependencies use a copyleft licence (e.g. GPL) that would require us to release
            TripWise under the same terms.
          </p>
        </Section>

        {/* 15 – Payments */}
        <Section title="4. Pricing and subscriptions">
          <p>
            TripWise is entirely free to use. There are no paid plans, subscriptions, in-app purchases, or
            premium features. We do not collect payment information of any kind.
          </p>
          <p>
            Should we ever introduce paid features in the future, we will update these Terms and provide
            clear disclosure of pricing, billing cycles, and cancellation terms before any charge is made.
          </p>
        </Section>

        {/* Disclaimer */}
        <Section title="5. Disclaimer of warranties">
          <p>
            TripWise is provided <strong>"as is"</strong> and <strong>"as available"</strong> without
            warranties of any kind, express or implied, including but not limited to warranties of
            merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <p>
            Place data is sourced from OpenTripMap and may be incomplete, inaccurate, or out of date. We
            do not guarantee the accuracy or reliability of any information displayed.
          </p>
        </Section>

        {/* Limitation of liability */}
        <Section title="6. Limitation of liability">
          <p>
            To the fullest extent permitted by applicable law, we shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising out of or relating to your use
            of TripWise.
          </p>
        </Section>

        {/* Governing law */}
        <Section title="7. Governing law">
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of the courts in Vellore, Tamil Nadu.
          </p>
        </Section>

        {/* Changes */}
        <Section title="8. Changes to these Terms">
          <p>
            We reserve the right to modify these Terms at any time. Changes take effect when posted with
            an updated "Last updated" date. Continued use of TripWise constitutes acceptance.
          </p>
        </Section>

        {/* Contact */}
        <Section title="9. Contact">
          <p>
            Questions about these Terms? Write to us at{' '}
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

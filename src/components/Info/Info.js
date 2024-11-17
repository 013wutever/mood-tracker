import React from 'react';
import { 
  Heart, 
  Mail, 
  CircleHelp, 
  Lightbulb,
  Shield,
  Clock
} from 'lucide-react';

const Info = ({ language = 'el' }) => {
  const translations = {
    el: {
      title: 'Σχετικά με το Mood Tracker',
      about: {
        title: 'Τι είναι το Mood Tracker;',
        content: 'Το Mood Tracker είναι μια εφαρμογή που σας βοηθά να παρακολουθείτε και να κατανοείτε καλύτερα τα συναισθήματά σας. Καταγράφοντας τακτικά τη διάθεσή σας, μπορείτε να αναγνωρίσετε μοτίβα και να βελτιώσετε τη συναισθηματική σας ευεξία.'
      },
      benefits: {
        title: 'Οφέλη',
        list: [
          'Καλύτερη κατανόηση των συναισθημάτων σας',
          'Αναγνώριση παραγόντων που επηρεάζουν τη διάθεσή σας',
          'Παρακολούθηση της συναισθηματικής σας προόδου',
          'Βελτίωση της συναισθηματικής νοημοσύνης',
          'Εντοπισμός μοτίβων συμπεριφοράς'
        ]
      },
      howToUse: {
        title: 'Πώς να το χρησιμοποιήσετε',
        steps: [
          'Επιλέξτε την τρέχουσα διάθεσή σας',
          'Διαλέξτε την κατηγορία που ταιριάζει καλύτερα',
          'Προσθέστε συγκεκριμένα συναισθήματα (έως 3)',
          'Καταγράψτε τυχόν σκέψεις στις σημειώσεις',
          'Παρακολουθήστε την πρόοδό σας στα στατιστικά'
        ]
      },
      contact: {
        title: 'Επικοινωνία',
        email: 'contant.therapyfield@gmail.com',
        message: 'Για οποιαδήποτε απορία ή πρόταση, επικοινωνήστε μαζί μας.'
      },
      privacy: {
        title: 'Προστασία Δεδομένων',
        content: 'Τα δεδομένα σας είναι ασφαλή και προστατεύονται. Δεν μοιραζόμαστε τις προσωπικές σας πληροφορίες με τρίτους.'
      }
    },
    en: {
      title: 'About Mood Tracker',
      about: {
        title: 'What is Mood Tracker?',
        content: 'Mood Tracker is an application that helps you monitor and better understand your emotions. By regularly recording your mood, you can identify patterns and improve your emotional well-being.'
      },
      benefits: {
        title: 'Benefits',
        list: [
          'Better understanding of your emotions',
          'Identification of factors affecting your mood',
          'Track your emotional progress',
          'Improve emotional intelligence',
          'Identify behavioral patterns'
        ]
      },
      howToUse: {
        title: 'How to Use',
        steps: [
          'Select your current mood',
          'Choose the most relevant category',
          'Add specific emotions (up to 3)',
          'Record any thoughts in the notes',
          'Monitor your progress in statistics'
        ]
      },
      contact: {
        title: 'Contact',
        email: 'contant.therapyfield@gmail.com',
        message: 'For any questions or suggestions, please contact us.'
      },
      privacy: {
        title: 'Data Protection',
        content: 'Your data is secure and protected. We do not share your personal information with third parties.'
      }
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-2xl font-semibold mb-4">{t.title}</h1>
      </header>

      {/* About */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-300" />
          <h2 className="text-xl font-medium">{t.about.title}</h2>
        </div>
        <p className="text-white/80 leading-relaxed">
          {t.about.content}
        </p>
      </section>

      {/* Benefits */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-300" />
          <h2 className="text-xl font-medium">{t.benefits.title}</h2>
        </div>
        <ul className="space-y-3">
          {t.benefits.list.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      {/* How to Use */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CircleHelp className="w-6 h-6 text-blue-300" />
          <h2 className="text-xl font-medium">{t.howToUse.title}</h2>
        </div>
        <div className="space-y-4">
          {t.howToUse.steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                {index + 1}
              </div>
              <div className="text-white/80 flex-grow pt-1">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glassmorphic rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-purple-300" />
            <h2 className="text-xl font-medium">{t.contact.title}</h2>
          </div>
          <p className="text-white/80 mb-4">{t.contact.message}</p>
          <a 
            href={`mailto:${t.contact.email}`}
            className="text-white/90 hover:text-white underline"
          >
            {t.contact.email}
          </a>
        </section>

        <section className="glassmorphic rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-300" />
            <h2 className="text-xl font-medium">{t.privacy.title}</h2>
          </div>
          <p className="text-white/80">
            {t.privacy.content}
          </p>
        </section>
      </div>

      {/* Last updated */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default Info;

import React from 'react';
import { 
  Heart, 
  Mail, 
  CircleHelp, 
  Lightbulb,
  Shield,
  Clock,
  Brain,
  Smile,
  LineChart,
  BookOpen
} from 'lucide-react';

const Info = ({ language = 'el' }) => {
  const translations = {
    el: {
      title: 'Σχετικά με το Mood Tracker',
      about: {
        title: 'Τι είναι το Mood Tracker;',
        content: 'Το Mood Tracker είναι μια εφαρμογή σχεδιασμένη για να σας βοηθήσει να κατανοήσετε καλύτερα τα συναισθήματά σας. Μέσω της καθημερινής καταγραφής της διάθεσης και των συναισθημάτων σας, μπορείτε να αναγνωρίσετε μοτίβα και να βελτιώσετε τη συναισθηματική σας ευεξία.'
      },
      benefits: {
        title: 'Οφέλη',
        list: [
          'Αυξημένη συναισθηματική επίγνωση',
          'Αναγνώριση προτύπων συμπεριφοράς',
          'Καλύτερη διαχείριση του στρες',
          'Βελτιωμένη αυτογνωσία',
          'Παρακολούθηση της προόδου σας',
          'Κατανόηση των παραγόντων που επηρεάζουν τη διάθεσή σας'
        ]
      },
      importance: {
        title: 'Γιατί είναι σημαντικό;',
        content: 'Η συναισθηματική υγεία είναι εξίσου σημαντική με τη σωματική υγεία. Η τακτική παρακολούθηση των συναισθημάτων μας μπορεί να βοηθήσει στην πρόληψη του στρες, του άγχους και της κατάθλιψης, ενώ παράλληλα ενισχύει τη συναισθηματική νοημοσύνη.'
      },
      features: {
        title: 'Χαρακτηριστικά',
        list: [
          'Εύκολη καταγραφή συναισθημάτων',
          'Αναλυτικά στατιστικά και γραφήματα',
          'Προσωποποιημένες αναφορές',
          'Υποστήριξη πολλαπλών γλωσσών',
          'Ασφαλής αποθήκευση δεδομένων'
        ]
      },
      contact: {
        title: 'Επικοινωνία',
        email: 'contant.therapyfield@gmail.com',
        message: 'Για οποιαδήποτε απορία ή πρόταση, μη διστάσετε να επικοινωνήσετε μαζί μας.'
      }
    },
    en: {
      title: 'About Mood Tracker',
      about: {
        title: 'What is Mood Tracker?',
        content: 'Mood Tracker is an application designed to help you better understand your emotions. Through daily tracking of your mood and emotions, you can identify patterns and improve your emotional well-being.'
      },
      benefits: {
        title: 'Benefits',
        list: [
          'Increased emotional awareness',
          'Recognition of behavioral patterns',
          'Better stress management',
          'Improved self-awareness',
          'Progress tracking',
          'Understanding factors affecting your mood'
        ]
      },
      importance: {
        title: 'Why is it important?',
        content: 'Emotional health is just as important as physical health. Regular monitoring of our emotions can help prevent stress, anxiety, and depression, while enhancing emotional intelligence.'
      },
      features: {
        title: 'Features',
        list: [
          'Easy emotion tracking',
          'Detailed statistics and graphs',
          'Personalized reports',
          'Multiple language support',
          'Secure data storage'
        ]
      },
      contact: {
        title: 'Contact',
        email: 'contant.therapyfield@gmail.com',
        message: 'For any questions or suggestions, please don\'t hesitate to contact us.'
      }
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="text-center">
        <h1 className="text-2xl font-semibold mb-4">{t.title}</h1>
      </header>

      {/* About */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-300" />
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
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.benefits.list.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      {/* Importance */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-300" />
          <h2 className="text-xl font-medium">{t.importance.title}</h2>
        </div>
        <p className="text-white/80 leading-relaxed">
          {t.importance.content}
        </p>
      </section>

      {/* Features */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-300" />
          <h2 className="text-xl font-medium">{t.features.title}</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.features.list.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-teal-300" />
          <h2 className="text-xl font-medium">{t.contact.title}</h2>
        </div>
        <p className="text-white/80 mb-4">{t.contact.message}</p>
        <a 
          href={`mailto:${t.contact.email}`}
          className="text-white/90 hover:text-white underline flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          {t.contact.email}
        </a>
      </section>

      {/* Last updated */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default Info;

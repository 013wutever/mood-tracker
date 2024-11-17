import { 
  Smile,
  Laugh,  // αντί για LaughingIcon
  Meh,
  Frown,
  Heart,
  Clock
} from 'lucide-react';
import googleSheetsService from '../../services/googleSheets';

const MoodEntry = ({ language = 'el', userEmail }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const translations = {
    el: {
      title: 'Πώς νιώθετε σήμερα;',
      categories: {
        personal: 'Προσωπικά',
        friends: 'Φίλοι',
        family: 'Οικογένεια',
        work: 'Επαγγελματικά',
        studies: 'Σπουδές',
        health: 'Υγεία',
        finances: 'Οικονομικά',
        entertainment: 'Ψυχαγωγία'
      },
      selectCategory: 'Επιλέξτε κατηγορία',
      selectEmotions: 'Επιλέξτε έως 3 συναισθήματα',
      notes: 'Σημειώσεις',
      notesPlaceholder: 'Προσθέστε τις σκέψεις σας...',
      submit: 'Καταχώρηση',
      submitting: 'Γίνεται καταχώρηση...',
      success: 'Η καταχώρηση ολοκληρώθηκε!',
      error: 'Κάτι πήγε στραβά. Προσπαθήστε ξανά.',
      maxEmotionsWarning: 'Μπορείτε να επιλέξετε έως 3 συναισθήματα',
      validationError: 'Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία'
    },
    en: {
      title: 'How are you feeling today?',
      categories: {
        personal: 'Personal',
        friends: 'Friends',
        family: 'Family',
        work: 'Work',
        studies: 'Studies',
        health: 'Health',
        finances: 'Finances',
        entertainment: 'Entertainment'
      },
      selectCategory: 'Select category',
      selectEmotions: 'Select up to 3 emotions',
      notes: 'Notes',
      notesPlaceholder: 'Add your thoughts...',
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Entry submitted successfully!',
      error: 'Something went wrong. Please try again.',
      maxEmotionsWarning: 'You can select up to 3 emotions',
      validationError: 'Please fill in all required fields'
    }
  };

  const moods = [
    { id: 'very-positive', icon: Laugh, color: 'bg-[#7FCDCD]/20', borderColor: 'border-[#7FCDCD]' },
    { id: 'positive', icon: Smile, color: 'bg-[#98FB98]/20', borderColor: 'border-[#98FB98]' },
    { id: 'neutral', icon: Meh, color: 'bg-[#D4E157]/20', borderColor: 'border-[#D4E157]' },
    { id: 'negative', icon: Frown, color: 'bg-[#FFB347]/20', borderColor: 'border-[#FFB347]' },
    { id: 'very-negative', icon: Heart, color: 'bg-[#FF9999]/20', borderColor: 'border-[#FF9999]' }
];

  const categories = Object.entries(translations[language].categories).map(([id, name]) => ({
    id,
    name,
    color: {
      personal: 'bg-purple-300/20 border-purple-300',
      friends: 'bg-green-300/20 border-green-300',
      family: 'bg-blue-300/20 border-blue-300',
      work: 'bg-orange-300/20 border-orange-300',
      studies: 'bg-yellow-300/20 border-yellow-300',
      health: 'bg-pink-300/20 border-pink-300',
      finances: 'bg-gray-300/20 border-gray-300',
      entertainment: 'bg-teal-300/20 border-teal-300'
    }[id]
  }));

  const emotions = [
    { name: "Χαρά", value: "joy", type: "positive" },
    { name: "Άγχος", value: "anxiety", type: "negative" },
    { name: "Ηρεμία", value: "calmness", type: "positive" },
    { name: "Απογοήτευση", value: "disappointment", type: "negative" },
    { name: "Θυμός", value: "anger", type: "negative" },
    { name: "Ευγνωμοσύνη", value: "gratitude", type: "positive" },
    { name: "Ζήλια", value: "jealousy", type: "negative" },
    { name: "Ανασφάλεια", value: "insecurity", type: "negative" },
    { name: "Ενθουσιασμός", value: "enthusiasm", type: "positive" },
    { name: "Ντροπή", value: "shame", type: "negative" },
    { name: "Περηφάνια", value: "pride", type: "positive" },
    { name: "Αγάπη", value: "love", type: "positive" },
    { name: "Φόβος", value: "fear", type: "negative" },
    { name: "Έκπληξη", value: "surprise", type: "neutral" },
    { name: "Ανακούφιση", value: "relief", type: "positive" }
  ];

  const resetForm = () => {
    setSelectedMood(null);
    setSelectedEmotions([]);
    setSelectedCategory(null);
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!selectedMood || !selectedCategory) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await googleSheetsService.addMoodEntry({
        userEmail,
        category: selectedCategory,
        moodEmoji: selectedMood,
        emotions: selectedEmotions,
        notes
      });

      if (result.success) {
        setSubmitStatus('success');
        setTimeout(() => {
          resetForm();
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Messages */}
      {submitStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl glassmorphic flex items-center gap-2
          ${submitStatus === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {submitStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>
            {translations[language][submitStatus === 'success' ? 'success' : 'error']}
          </span>
        </div>
      )}

      {/* Moods */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].title}</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {moods.map((mood) => {
            const MoodIcon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`${mood.color} ${
                  selectedMood === mood.id ? `${mood.borderColor} border-2` : 'border-transparent border-2'
                } glassmorphic p-4 rounded-full transition-transform hover:-translate-y-1`}
              >
                <MoodIcon className="w-8 h-8" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].selectCategory}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${category.color} ${
                selectedCategory === category.id ? 'border-2' : 'border-transparent border-2'
              } glassmorphic p-3 rounded-xl text-sm transition-transform hover:-translate-y-1`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].selectEmotions}</h2>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => {
                if (selectedEmotions.includes(emotion.value)) {
                  setSelectedEmotions(prev => prev.filter(e => e !== emotion.value));
                } else if (selectedEmotions.length < 3) {
                  setSelectedEmotions(prev => [...prev, emotion.value]);
                }
              }}
              className={`${
                selectedEmotions.includes(emotion.value) 
                  ? emotion.type === 'positive' 
                    ? 'bg-green-500/20 border-green-500' 
                    : emotion.type === 'negative'
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-yellow-500/20 border-yellow-500'
                  : 'bg-white/5'
              } ${
                selectedEmotions.includes(emotion.value) ? 'border-2' : 'border-transparent border-2'
              } glassmorphic px-4 py-2 rounded-full text-sm transition-all hover:-translate-y-1`}
            >
              {emotion.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xl mb-4">{translations[language].notes}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={translations[language].notesPlaceholder}
          className="w-full h-32 glassmorphic bg-white/10 rounded-xl p-4 placeholder-white/50 resize-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-white/50">
          {notes.length}/500
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full glassmorphic py-3 rounded-xl transition-all flex items-center justify-center gap-2
          ${isSubmitting ? 'bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}
      >
        {isSubmitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            {translations[language].submitting}
          </>
        ) : (
          translations[language].submit
        )}
      </button>

      {/* Timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default MoodEntry;

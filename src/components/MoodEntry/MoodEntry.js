import React, { useState } from 'react';
import { 
  Smile,
  Laugh,
  Meh,
  Frown,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

const MoodEntry = ({ language = 'el', userEmail }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const moods = [
    { 
      id: 'very-negative', 
      icon: Frown, 
      color: 'bg-red-200/40',
      activeColor: 'bg-red-200/60',
      glowColor: 'shadow-red-200/30',
      label: 'Πολύ αρνητικός'
    },
    { 
      id: 'negative', 
      icon: Frown, 
      color: 'bg-orange-200/40',
      activeColor: 'bg-orange-200/60',
      glowColor: 'shadow-orange-200/30',
      label: 'Αρνητικός'
    },
    { 
      id: 'neutral', 
      icon: Meh, 
      color: 'bg-yellow-200/40',
      activeColor: 'bg-yellow-200/60',
      glowColor: 'shadow-yellow-200/30',
      label: 'Ουδέτερος'
    },
    { 
      id: 'positive', 
      icon: Smile, 
      color: 'bg-green-200/40',
      activeColor: 'bg-green-200/60',
      glowColor: 'shadow-green-200/30',
      label: 'Θετικός'
    },
    { 
      id: 'very-positive', 
      icon: Laugh, 
      color: 'bg-cyan-200/40',
      activeColor: 'bg-cyan-200/60',
      glowColor: 'shadow-cyan-200/30',
      label: 'Πολύ θετικός'
    }
  ];

  const emotions = [
    // Θετικά
    { name: "Χαρά", value: "joy", type: "positive" },
    { name: "Ηρεμία", value: "calm", type: "positive" },
    { name: "Ευγνωμοσύνη", value: "gratitude", type: "positive" },
    { name: "Ενθουσιασμός", value: "enthusiasm", type: "positive" },
    { name: "Αισιοδοξία", value: "optimism", type: "positive" },
    { name: "Ικανοποίηση", value: "satisfaction", type: "positive" },
    { name: "Περηφάνια", value: "pride", type: "positive" },
    { name: "Αγάπη", value: "love", type: "positive" },
    { name: "Ανακούφιση", value: "relief", type: "positive" },
    { name: "Γαλήνη", value: "serenity", type: "positive" },
    
    // Αρνητικά
    { name: "Άγχος", value: "anxiety", type: "negative" },
    { name: "Θυμός", value: "anger", type: "negative" },
    { name: "Λύπη", value: "sadness", type: "negative" },
    { name: "Απογοήτευση", value: "disappointment", type: "negative" },
    { name: "Ανησυχία", value: "worry", type: "negative" },
    { name: "Ματαίωση", value: "frustration", type: "negative" },
    { name: "Ντροπή", value: "shame", type: "negative" },
    { name: "Μοναξιά", value: "loneliness", type: "negative" },
    { name: "Φόβος", value: "fear", type: "negative" },
    { name: "Ανασφάλεια", value: "insecurity", type: "negative" }
  ];

  const categories = [
    { id: 'personal', name: 'Προσωπικά', color: 'bg-purple-300/20 hover:bg-purple-300/30' },
    { id: 'friends', name: 'Φίλοι', color: 'bg-green-300/20 hover:bg-green-300/30' },
    { id: 'family', name: 'Οικογένεια', color: 'bg-blue-300/20 hover:bg-blue-300/30' },
    { id: 'work', name: 'Επαγγελματικά', color: 'bg-orange-300/20 hover:bg-orange-300/30' },
    { id: 'studies', name: 'Σπουδές', color: 'bg-yellow-300/20 hover:bg-yellow-300/30' },
    { id: 'health', name: 'Υγεία', color: 'bg-pink-300/20 hover:bg-pink-300/30' },
    { id: 'finances', name: 'Οικονομικά', color: 'bg-gray-300/20 hover:bg-gray-300/30' },
    { id: 'entertainment', name: 'Ψυχαγωγία', color: 'bg-teal-300/20 hover:bg-teal-300/30' }
  ];

  return (
    <div className="space-y-8 content-wrapper">
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
            {submitStatus === 'success' ? 'Η καταχώρηση ολοκληρώθηκε!' : 'Κάτι πήγε στραβά. Προσπαθήστε ξανά.'}
          </span>
        </div>
      )}

      {/* Moods */}
      <div>
        <h2 className="text-xl mb-4 text-white">Πώς νιώθετε σήμερα;</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {moods.map((mood) => {
            const MoodIcon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`
                  transition-all duration-300
                  p-4 rounded-full
                  ${mood.color}
                  hover:scale-110
                  hover:shadow-lg
                  ${selectedMood === mood.id 
                    ? `${mood.activeColor} shadow-lg ${mood.glowColor} scale-110` 
                    : ''
                  }
                `}
                title={mood.label}
              >
                <MoodIcon className="w-8 h-8" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl mb-4 text-white">Επιλέξτε κατηγορία</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-3 rounded-xl text-sm
                transition-all duration-300
                ${category.color}
                hover:scale-105
                hover:shadow-lg
                ${selectedCategory === category.id 
                  ? 'scale-105 shadow-lg border-2 border-white/30' 
                  : ''
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div>
        <h2 className="text-xl mb-4 text-white">Επιλέξτε έως 3 συναισθήματα</h2>
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
              disabled={selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)}
              className={`
                px-4 py-2 rounded-full text-sm
                transition-all duration-300
                ${emotion.type === 'positive' 
                  ? 'bg-green-200/20 hover:bg-green-200/30' 
                  : 'bg-red-200/20 hover:bg-red-200/30'
                }
                ${selectedEmotions.includes(emotion.value)
                  ? `scale-110 shadow-lg ${
                      emotion.type === 'positive'
                        ? 'bg-green-200/40 border-2 border-green-200/60'
                        : 'bg-red-200/40 border-2 border-red-200/60'
                    }`
                  : ''
                }
                ${selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion.value)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
                }
              `}
            >
              {emotion.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-xl mb-4 text-white">Σημειώσεις</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Προσθέστε τις σκέψεις σας..."
          className="w-full h-32 glassmorphic bg-white/10 rounded-xl p-4 
                    placeholder-white/50 resize-none focus:ring-2 
                    focus:ring-white/30 focus:outline-none"
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
        className={`
          w-full py-3 rounded-xl
          transition-all duration-300
          glassmorphic
          ${isSubmitting 
            ? 'bg-white/10 cursor-not-allowed' 
            : 'bg-white/20 hover:bg-white/30 hover:shadow-lg'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader className="w-5 h-5 animate-spin inline-block mr-2" />
            Γίνεται καταχώρηση...
          </>
        ) : (
          'Καταχώρηση'
        )}
      </button>

      {/* Timestamp */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleTimeString('el-GR')}
      </div>
    </div>
  );
};

export default MoodEntry;

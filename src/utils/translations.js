// translations.js

export const translations = {
  el: {
    // Navigation & Common
    nav: {
      moodEntry: 'Καταχώρηση Συναισθήματος',
      progress: 'Στατιστικά & Πρόοδος',
      myEntries: 'Οι Καταχωρήσεις μου',
      info: 'Πληροφορίες',
      logout: 'Αποσύνδεση',
      welcomeBack: 'Καλώς ήρθατε'
    },

    // Mood Entry
    moodEntry: {
      title: 'Πώς Νιώθετε Σήμερα;',
      moods: {
        veryPositive: 'Πολύ Θετικός',
        positive: 'Θετικός',
        neutral: 'Ουδέτερος',
        negative: 'Αρνητικός',
        veryNegative: 'Πολύ Αρνητικός'
      },
      categories: {
        title: 'Επιλέξτε Κατηγορία',
        personal: 'Προσωπικά',
        friends: 'Φίλοι',
        family: 'Οικογένεια',
        work: 'Επαγγελματικά',
        studies: 'Σπουδές',
        health: 'Υγεία',
        finances: 'Οικονομικά',
        entertainment: 'Ψυχαγωγία'
      },
      emotions: {
        title: 'Επιλέξτε έως 3 Συναισθήματα',
        // Θετικά συναισθήματα
        χαρά: 'Χαρά',
        ενθουσιασμός: 'Ενθουσιασμός',
        αγάπη: 'Αγάπη',
        ηρεμία: 'Ηρεμία',
        ικανοποίηση: 'Ικανοποίηση',
        ανακούφιση: 'Ανακούφιση',
        περηφάνια: 'Περηφάνια',
        ευγνωμοσύνη: 'Ευγνωμοσύνη',
        ελπίδα: 'Ελπίδα',
        // Αρνητικά συναισθήματα
        άγχος: 'Άγχος',
        φόβος: 'Φόβος',
        θυμός: 'Θυμός',
        λύπη: 'Λύπη',
        απογοήτευση: 'Απογοήτευση',
        ζήλια: 'Ζήλια',
        ντροπή: 'Ντροπή',
        ενοχή: 'Ενοχή',
        σύγχυση: 'Σύγχυση',
        έκπληξη: 'Έκπληξη'
      },
      notes: {
        title: 'Σημειώσεις',
        placeholder: 'Προσθέστε τις σκέψεις σας...',
        charCount: 'χαρακτήρες'
      },
      submit: 'Καταχώρηση',
      submitting: 'Γίνεται καταχώρηση...',
      success: 'Η καταχώρηση ολοκληρώθηκε!',
      error: 'Κάτι πήγε στραβά. Προσπαθήστε ξανά.'
    },

    // Progress & Stats
    progress: {
      title: 'Στατιστικά & Πρόοδος',
      filters: {
        week: 'Εβδομάδα',
        month: 'Μήνας',
        year: 'Έτος',
        all: 'Όλα'
      },
      stats: {
        totalEntries: 'Συνολικές Καταχωρήσεις',
        weeklyCompletion: 'Ολοκλήρωση Εβδομάδας',
        positivityRatio: 'Δείκτης Θετικότητας'
      },
      charts: {
        emotions: 'Συναισθήματα',
        mood: 'Διάθεση',
        category: 'Κατηγορία',
        timeOfDay: 'Ώρα Ημέρας',
        monthlyEntries: 'Καταχωρήσεις ανά Μήνα',
        emotionsByCategory: 'Συναισθήματα ανά Κατηγορία',
        positiveVsNegative: 'Θετικά vs Αρνητικά Συναισθήματα',
        negativeByCategory: 'Αρνητικότητα ανά Κατηγορία'
      },
      timeOfDay: {
        morning: 'Πρωί',
        noon: 'Μεσημέρι',
        afternoon: 'Απόγευμα',
        evening: 'Βράδυ'
      }
    },

    // My Entries
    myEntries: {
      title: 'Οι Καταχωρήσεις μου',
      calendar: {
        today: 'Σήμερα',
        noEntries: 'Δεν υπάρχουν καταχωρήσεις για αυτή την ημέρα',
        viewType: {
          month: 'Μήνας',
          year: 'Έτος'
        },
        navigate: {
          previous: 'Προηγούμενο',
          next: 'Επόμενο',
          back: 'Πίσω'
        },
        monthNames: [
          'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
          'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
          'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
        ],
        monthNamesShort: [
          'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν',
          'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'
        ],
        weekDays: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ']
      }
    },

    // Common States
    states: {
      loading: 'Φόρτωση...',
      error: 'Σφάλμα φόρτωσης δεδομένων',
      retry: 'Δοκιμάστε ξανά',
      noData: 'Δεν υπάρχουν δεδομένα'
    }
  },

  en: {
    // Navigation & Common
    nav: {
      moodEntry: 'Mood Entry',
      progress: 'Statistics & Progress',
      myEntries: 'My Entries',
      info: 'Information',
      logout: 'Logout',
      welcomeBack: 'Welcome back'
    },

    // Mood Entry
    moodEntry: {
      title: 'How Are You Feeling Today?',
      moods: {
        veryPositive: 'Very Positive',
        positive: 'Positive',
        neutral: 'Neutral',
        negative: 'Negative',
        veryNegative: 'Very Negative'
      },
      categories: {
        title: 'Select Category',
        personal: 'Personal',
        friends: 'Friends',
        family: 'Family',
        work: 'Work',
        studies: 'Studies',
        health: 'Health',
        finances: 'Finances',
        entertainment: 'Entertainment'
      },
      emotions: {
        title: 'Select up to 3 Emotions',
        // Positive emotions
        χαρά: 'Joy',
        ενθουσιασμός: 'Enthusiasm',
        αγάπη: 'Love',
        ηρεμία: 'Calm',
        ικανοποίηση: 'Satisfaction',
        ανακούφιση: 'Relief',
        περηφάνια: 'Pride',
        ευγνωμοσύνη: 'Gratitude',
        ελπίδα: 'Hope',
        // Negative emotions
        άγχος: 'Anxiety',
        φόβος: 'Fear',
        θυμός: 'Anger',
        λύπη: 'Sadness',
        απογοήτευση: 'Disappointment',
        ζήλια: 'Jealousy',
        ντροπή: 'Shame',
        ενοχή: 'Guilt',
        σύγχυση: 'Confusion',
        έκπληξη: 'Surprise'
      },
      notes: {
        title: 'Notes',
        placeholder: 'Add your thoughts...',
        charCount: 'characters'
      },
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Entry submitted successfully!',
      error: 'Something went wrong. Please try again.'
    },

    // Progress & Stats
    progress: {
      title: 'Statistics & Progress',
      filters: {
        week: 'Week',
        month: 'Month',
        year: 'Year',
        all: 'All'
      },
      stats: {
        totalEntries: 'Total Entries',
        weeklyCompletion: 'Weekly Completion',
        positivityRatio: 'Positivity Ratio'
      },
      charts: {
        emotions: 'Emotions',
        mood: 'Mood',
        category: 'Category',
        timeOfDay: 'Time of Day',
        monthlyEntries: 'Monthly Entries',
        emotionsByCategory: 'Emotions by Category',
        positiveVsNegative: 'Positive vs Negative Emotions',
        negativeByCategory: 'Negativity by Category'
      },
      timeOfDay: {
        morning: 'Morning',
        noon: 'Noon',
        afternoon: 'Afternoon',
        evening: 'Evening'
      }
    },

    // My Entries
    myEntries: {
      title: 'My Entries',
      calendar: {
        today: 'Today',
        noEntries: 'No entries for this day',
        viewType: {
          month: 'Month',
          year: 'Year'
        },
        navigate: {
          previous: 'Previous',
          next: 'Next',
          back: 'Back'
        },
        monthNames: [
          'January', 'February', 'March', 'April',
          'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December'
        ],
        monthNamesShort: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }
    },

    // Common States
    states: {
      loading: 'Loading...',
      error: 'Error loading data',
      retry: 'Try again',
      noData: 'No data available'
    }
  }
};

// Κατηγοριοποίηση συναισθημάτων
export const emotionTypes = {
  positive: ['χαρά', 'ενθουσιασμός', 'αγάπη', 'ηρεμία', 'ικανοποίηση', 'ανακούφιση', 'περηφάνια', 'ευγνωμοσύνη', 'ελπίδα'],
  negative: ['άγχος', 'φόβος', 'θυμός', 'λύπη', 'απογοήτευση', 'ζήλια', 'ντροπή', 'ενοχή', 'σύγχυση'],
  neutral: ['έκπληξη']
};

// Helper functions
export const getTranslation = (language, path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], translations[language]) || path;
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Function to get emotion type (positive/negative/neutral)
export const getEmotionType = (emotion) => {
  if (emotionTypes.positive.includes(emotion)) return 'positive';
  if (emotionTypes.negative.includes(emotion)) return 'negative';
  return 'neutral';
};

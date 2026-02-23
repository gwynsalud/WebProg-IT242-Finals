const { createApp } = Vue;

createApp({
    data() {
        return {
            title: "Trial of Knowledge",
            currentStep: 0,
            userAnswer: "",
            completed: false,
            questions: [
                { text: "I have no voice, but I tell the world how to look. I wear many sheets, but I never sleep. What am I?", answer: "CSS" },
                { text: "I am a view that sees all, reactive and swift. I bind the data to the soul of the page. What am I?", answer: "Vue" },
                { text: "I am the vault of ten thousand names, the memory of the tavern that never fades. What am I?", answer: "Supabase" }
            ]
        }
    },
    methods: {
        checkAnswer() {
            const correct = this.questions[this.currentStep].answer.toLowerCase();
            if (this.userAnswer.toLowerCase().trim() === correct) {
                if (this.currentStep < this.questions.length - 1) {
                    this.currentStep++;
                    this.userAnswer = "";
                } else {
                    this.finishQuiz();
                }
            } else {
                alert("The Scholar frowns. 'Not quite right, traveler.'");
            }
        },
        finishQuiz() {
            this.completed = true;
            // Save progress so other pages know!
            localStorage.setItem('scholar_trial_passed', 'true');
        }
    },
    mounted() {
        // Check if they already passed before
        if (localStorage.getItem('scholar_trial_passed') === 'true') {
            this.completed = true;
        }
    }
}).mount('#quiz-app');
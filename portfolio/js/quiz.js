const { createApp } = Vue;

createApp({
    data() {
        return {
            title: "Trial of Knowledge",
            currentStep: 0,
            userAnswer: "",
            completed: false,
            questions: [
                { text: "What is the primary language of the Web's visual realm?", answer: "CSS" },
                { text: "Which framework powers this magical interface?", answer: "Vue" },
                { text: "Where are the Tavern's records stored?", answer: "Supabase" }
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
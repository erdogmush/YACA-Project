/*
  Extend the question types with a new type of question: MultipleChoiceQuestion.
  A MultipleChoiceQuestion has has a single correct answer, and the user can only 
  choose one option in the answer (the answer is a string instead of an array of
  strings).
*/

/* 
1. Define a new type called Answer that represents the possible types of answers to 
   a question. It can be either a string for a MultipleChoiceQuestion or an array 
   of strings for a MultipleAnswerQuestion. 
*/

type Answer = string | string[];


/*
2. Modify the IQuestion interface to change the type of the property answer so that
   it can accommodate both a a MultipleChoiceQuestion and a MultipleAnswerQuestion.
*/

interface IQuestion {
  question: string;
  options: string[];
  answer: Answer;
}

/* 
3. Define a new abstract superclass Question that represents a generic Question,
   implements IQuestion and has an abstract method grade that will be implemented 
   by concrete subclasses.The constructor should accommodate both a 
   MultipleChoiceQuestion and a MultipleAnswerQuestion.
*/

abstract class Question implements IQuestion {
  constructor(
    public question: string,
    public options: string[],
    public answer: Answer
  ) { }

  abstract grade(answer: Answer, points: number): number;
}

/* 
4. Now define a concrete subclass of Question to represent MultipleChoiceQuestion.
   - The constructor should be tailerod to a MultipleChoiceQuestion that accepts a
   single answer. 
   - The class should implement the grade method such that the method returns the 
     specified number of points if the provided answer is correct, and 0 otherwise.
   - The method should throw an error if the provided answer is not included in the  
     question's options, with the error message: "Invalid answer: " + answer.
*/

class MultipleChoiceQuestion extends Question {
  grade(answer: Answer, points: number): number {
    if (typeof answer !== 'string') {
      throw new Error("Invalid answer: " + answer);
    }
    if (!this.options.includes(answer)) {
      throw new Error("Invalid answer: " + answer);
    }
    return answer === this.answer ? points : 0;
  }
}

/* 
5. Modify the abstract class MultipleAnswerQuestion to inherit from Question.
  - Change the grade method so that it throws an error if the provided answer
    includes any invalid values not included in the options, with the 
    error message: "Invalid answer: " + invalidValue.
*/

abstract class MultipleAnswerQuestion extends Question {
  constructor(question: string, options: string[], answer: string[]) {
    super(question, options, answer);
  }

  grade(answer: Answer, points: number): number {
    if (!Array.isArray(answer)) {
      throw new Error("Invalid answer: " + answer);
    }

    const invalidAnswer = answer.find((a) => !this.options.includes(a));
    if (invalidAnswer) {
      throw new Error("Invalid answer: " + invalidAnswer);
    }

    return this.gradeSpecific(answer, points);
  }

  abstract gradeSpecific(answer: string[], points: number): number;
}

class MAQuestionWPenalty extends MultipleAnswerQuestion {
  gradeSpecific(answer: string[], points: number): number {
    let sumPoints = 0;

    for (let answerOption of answer) {
      // correct answer
      if (this.answer.includes(answerOption)) {
        sumPoints += points / this.answer.length;
      } else {
        // incorect answer with penalty
        sumPoints -= points / this.answer.length;
      }
    }

    return sumPoints >= 0 ? sumPoints : 0;
  }
}

class MAQuestionWoPenalty extends MultipleAnswerQuestion {
  gradeSpecific(answer: string[], points: number): number {
    let sumPoints = 0;

    // traverse user's answer, adding partial score if this answer in the correct answer options
    for (let answerOption of answer) {
      if (this.answer.includes(answerOption)) {
        sumPoints += points / this.options.length;
      }
    }

    // traverse all options, adding partial score if this option is neither the correct answer nor selected by the user 
    for (let option of this.options) {
      if (!this.answer.includes(option) && !answer.includes(option)) {
        sumPoints += points / this.options.length;
      }
    }

    return sumPoints;
  }
}

/* 
6. Modify the Quiz class as appropriate. 
   - The constructor should accept an array of questions: questions of any grading 
     type can be included in the array (multiple answer with or without penalty, or 
     multiple choice).
   - The grade method of the Quiz class should now be an asyncronous function. It
     should return a Promise that resolves to the grand total of the number of points
     earned by the user. 
*/

class Quiz {
  private questions: Question[];

  constructor(questions: Question[]) {
    this.questions = questions;
  }

  async grade(answers: Answer[], pointsPerQuestion: number): Promise<number> {
    let totalPoints = 0;

    for (let i = 0; i < this.questions.length; i++) {
      try {
        const points = await this.questions[i].grade(answers[i], pointsPerQuestion);
        totalPoints += points;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    }

    return totalPoints;
  }
}

/* 
7. Test your implementation using your quiz from Part 1 and by defining a new second 
   quiz on advanced TypeScript. The second quiz should have two multipe-choice questions, 
   one multiple-answer question with penalty, one multiple-answer question without penalty, 
   one question with an invalid answer.
    - The second quiz should mix correct, incorrect, and partially correct answers.
    - Call the grade method of both quizzes asynconously, without blocking the execution
      (you should use the .then and .catch methods).
*/

const quiz = new Quiz([
  new MultipleChoiceQuestion('Which one is a fruit?', ['Apple', 'Car', 'Dog'], 'Apple'),
  new MultipleChoiceQuestion('Which one is a fruit?', ['Apple', 'Car', 'Dog'], 'Apple'),
  new MAQuestionWPenalty('Select all fruits', ['Apple', 'Banana', 'Car'], ['Apple', 'Banana']),
  new MAQuestionWoPenalty('Select all colors', ['Red', 'Green', 'Blue'], ['Red', 'Blue']),
  new MAQuestionWoPenalty('Select all colors', ['Red', 'Green', 'Blue'], ['Red', 'Blue'])
]);

const answers = [
  'Apple',                // multipe-choice questions with correct answer
  'Car',                  // multipe-choice questions with invalid answer
  ['Apple', 'Car'],        // multiple-answer question with penalty
  ['Red', 'Green'],        // multiple-answer question without penalty
  ['Red', 'Green', 'Yellow'] // multiple-answer question without penalty with invalid answer

];

quiz.grade(answers, 3).then((totalPoints) => {
  console.log('Total Points:', totalPoints);
}).catch((error) => {
  console.error('Error:', error);
});


/* 
8. Test your implementation by running the provided automated tests as follows. If all tests 
   pass, then your implmentation is probably correct and you can submit your solution.

   % npm run test:exP2
*/

export {
  Question,
  Quiz,
  MultipleChoiceQuestion,
  MAQuestionWoPenalty,
  MAQuestionWPenalty
};

export type { IQuestion, Answer };

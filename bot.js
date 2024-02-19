const { Telegraf, Scenes, session, Markup } = require('telegraf');
const Calendar = require('telegraf-calendar-telegram');


// Create a new instance of the Telegraf bot
const bot = new Telegraf('5805295303:AAGHdT0oLQPVghoWZ7_oo1hGM4bVDus689c');
const calendar = new Calendar(bot);

const questionScene = new Scenes.BaseScene('QUESTION_SCENE');

const questions = ['What is the time?', 'What is the venue?', 'How much was spent?',
'What is the name of the client?', 'Where did the lead come from?', 'What are the notes about the client?',
'What is the client\'s age?', 'What is the client\'s marital status?', 'How many dependents does the client have?',
'What is the client\'s occupation?', 'What is the client\'s annual income?', 'What was sold to the client?',
'What was proposed to the client?', 'What is the date of the next appointment?'];
let date = [];
let answers = [];
let notes = [];

questionScene.enter((ctx) => {
    ctx.reply('What is the date?', calendar.getCalendar());
});

bot.action(/.*/, (ctx) => {
    ctx.answerCbQuery();
    const dateComponents = ctx.update.callback_query.data.split('-').slice(2);
    dateComponents.shift();
    const formattedDate = dateComponents.reverse().join('-');
    date.push(formattedDate);
    ctx.reply(questions[0]);
});

questionScene.on('text', (ctx) => {
    if (ctx.message.text === '/done') {
        if (notes.length > 0) {
            answers.push('- ' + notes.join('\n- '));
            notes = [];
        }
        if (answers.length < questions.length) {
            ctx.reply(questions[answers.length]);
        }
    } else if (answers.length === questions.indexOf('What are the notes about the client?')) {
        notes.push(ctx.message.text);
        ctx.reply('Enter another note, or type /done when finished');
    } else {
        answers.push(ctx.message.text);
        if (answers.length < questions.length) {
            ctx.reply(questions[answers.length]);
        } else {
            ctx.reply(
                `*Notes After Appointment*
                
*Date:* ${date[0]}
*Time:* ${answers[0]}
*Venue:* ${answers[1]}
*Amount Spent:* ${answers[2]}
                
*Name:* ${answers[3]}
*Leads from:* ${answers[4]}
*Notes about client (mainly what was discussed or talked about during the appointment):*
${answers[5]}
                
*Client age:* ${answers[6]}
*Marital Status:* ${answers[78]}
*Dependents:*  ${answers[8]}
*Occupation:* ${answers[9]}
*Annual Income:* ${answers[10]}
*What was sold:* ${answers[11]}
*What was proposed:* ${answers[12]}
*Date of Next Appt:* ${answers[13]}`,
{ parse_mode: 'Markdown' }
);
            answers = []; // Reset answers
            ctx.scene.leave();
        }
    }
});

const stage = new Scenes.Stage([questionScene]);

bot.use(session());
bot.use(stage.middleware());

bot.command('start', (ctx) => {
    ctx.scene.enter('QUESTION_SCENE');
});

// Start the bot
bot.launch();

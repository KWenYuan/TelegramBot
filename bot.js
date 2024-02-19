const { Telegraf, Scenes, session, Markup } = require('telegraf');
const Calendar = require('telegraf-calendar-telegram');

const timeKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('01:00', '01:00'),
    Markup.button.callback('02:00', '02:00'),
    Markup.button.callback('03:00', '03:00'),
    Markup.button.callback('04:00', '04:00'),
    Markup.button.callback('05:00', '05:00'),
    Markup.button.callback('06:00', '06:00'),
    Markup.button.callback('07:00', '07:00'),
    Markup.button.callback('08:00', '08:00'),
    Markup.button.callback('09:00', '09:00'),
    Markup.button.callback('10:00', '10:00'),
    Markup.button.callback('11:00', '11:00'),
    Markup.button.callback('12:00', '12:00'),
    Markup.button.callback('13:00', '13:00'),
    Markup.button.callback('14:00', '14:00'),
    Markup.button.callback('15:00', '15:00'),
    Markup.button.callback('16:00', '16:00'),
    Markup.button.callback('17:00', '17:00'),
    Markup.button.callback('18:00', '18:00'),
    Markup.button.callback('19:00', '19:00'),
    Markup.button.callback('20:00', '20:00'),
    Markup.button.callback('21:00', '21:00'),
    Markup.button.callback('22:00', '22:00'),
    Markup.button.callback('23:00', '23:00'),
    Markup.button.callback('00:00', '00:00'),
    // Add more buttons as needed
], {columns:4});

// Create a new instance of the Telegraf bot
const bot = new Telegraf('5805295303:AAGHdT0oLQPVghoWZ7_oo1hGM4bVDus689c');
const calendar = new Calendar(bot);

const questionScene = new Scenes.BaseScene('QUESTION_SCENE');

const questions = ['What is the venue?', 'How much was spent?',
'What is the name of the client?', 'Where did the lead come from?', 'What are the notes about the client?',
'What is the client\'s age?', 'What is the client\'s marital status?', 'How many dependents does the client have?',
'What is the client\'s occupation?', 'What is the client\'s annual income?', 'What was sold to the client?',
'What was proposed to the client?', 'What is the date of the next appointment?'];
let date = [];
let time = [];
let answers = [];
let notes = [];

questionScene.enter((ctx) => {
    ctx.reply('What is the date?', calendar.getCalendar());
});

bot.action(/calendar-telegram/, (ctx) => {
    ctx.answerCbQuery();
    const dateComponents = ctx.update.callback_query.data.split('-').slice(2);
    dateComponents.shift();
    const formattedDate = dateComponents.reverse().join('-');
    date.push(formattedDate);
    ctx.reply('What is the time?', timeKeyboard);
});

bot.action(/[\d]{2}:[\d]{2}/, (ctx) => {
    ctx.answerCbQuery();
    const formattedTime = ctx.update.callback_query.data;
    time.push(formattedTime);
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
*Time:* ${time[0]}
*Venue:* ${answers[0]}
*Amount Spent:* $${answers[1]}
                
*Name:* ${answers[2]}
*Leads from:* ${answers[3]}
*Notes about client (mainly what was discussed or talked about during the appointment):*
${answers[4]}
                
*Client age:* ${answers[5]}
*Marital Status:* ${answers[6]}
*Dependents:*  ${answers[7]}
*Occupation:* ${answers[8]}
*Annual Income:* $${answers[9]}
*What was sold:* ${answers[10]}
*What was proposed:* ${answers[11]}
*Date of Next Appt:* ${answers[12]}`,
{ parse_mode: 'Markdown' }
);
            date = []; // Reset date
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

const { Telegraf, Scenes, session, Markup } = require('telegraf');

// Create a new instance of the Telegraf bot
const bot = new Telegraf('5805295303:AAGHdT0oLQPVghoWZ7_oo1hGM4bVDus689c');

// Register a command handler
// bot.command('start', (ctx) => {
//     ctx.reply('Hello! Welcome to our customer service bot. How can we assist you today?', 
//         Markup.inlineKeyboard([
//             Markup.button.callback('Order Inquiry', 'order'),
//             Markup.button.callback('Refund Request', 'refund'),
//             Markup.button.callback('Shipping Inquiry', 'shipping')
//         ])
//     );
// });

// // Register callback query handler
// bot.action('order', async (ctx) => {
//     await ctx.editMessageReplyMarkup({});
//     ctx.reply('Please provide your order number so we can assist you further.');
// });

// bot.action('refund', async (ctx) => {
//     await ctx.editMessageReplyMarkup({});
//     ctx.reply('To request a refund, please visit our website and fill out the refund form.');
// });

// bot.action('shipping', async (ctx) => {
//     await ctx.editMessageReplyMarkup({});
//     ctx.reply('For shipping inquiries, please contact our support team at support@example.com.');
// });


const questionScene = new Scenes.BaseScene('QUESTION_SCENE');

const questions = ['What is the date?', 'What is the time?', 'What is the venue?', 'How much was spent?',
'What is the name of the client?', 'Where did the lead come from?', 'What are the notes about the client?',
'What is the client\'s age?', 'What is the client\'s marital status?', 'How many dependents does the client have?',
'What is the client\'s occupation?', 'What is the client\'s annual income?', 'What was sold to the client?',
'What was proposed to the client?', 'When is the next appointment?'];
let answers = [];
let notes = [];

questionScene.enter((ctx) => {
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
                
*Date:* ${answers[0]}
*Time:* ${answers[1]}
*Venue:* ${answers[2]}
*Amount Spent:* ${answers[3]}
                
*Name:* ${answers[4]}
*Leads from:* ${answers[5]}
*Notes about client (mainly what was discussed or talked about during the appointment):*
${answers[6]}
                
*Client age:* ${answers[7]}
*Marital Status:* ${answers[8]}
*Dependents:*  ${answers[9]}
*Occupation:* ${answers[10]}
*Annual Income:* ${answers[11]}
*What was sold:* ${answers[12]}
*What was proposed:* ${answers[13]}
*Date of Next Appt:* ${answers[14]}`,
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

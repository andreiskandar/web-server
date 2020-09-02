const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const alphanumeric = require('alphanumeric-id');
const uuid = require('uuid').v4;

// const ejs = require('ejs');
const app = express();
const PORT = 8080;

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const users = {
	userRandomID: {
		id: 'userRandomID',
		email: 'user@example.com',
		password: 'purple-monkey-dinosaur',
	},
	user2RandomID: {
		id: 'user2RandomID',
		email: 'user2@example.com',
		password: 'dishwasher-funk',
	},
};

const ERROR_MESSAGE = {
	no_email_and_password: 'Please enter email or password',
	issue_with_email_password: 'There is an issue with email or password',
	account_does_exist: 'Account does not exist. Please sign up new account',
};

const generateNewID = () => {
	return uuid().split('-')[1];
};

const generateRandomString = () => {
	return alphanumeric(6);
};

const doesNewEmailExist = (newEmail) => {
	const emailDB = Object.keys(users).map((id) => users[id].email);
	return emailDB.includes(newEmail);
};

const validatePassword = (userEmail, userPassword) => {
	for (const id in users) {
		return users[id].email === userEmail && users[id].password === userPassword;
	}
	return false;
};

app.set('view engine', 'ejs');

const urlDatabase = {
	b2xVn2: 'http://www.lighthouselabs.ca',
	'9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => {});

app.get('/urls', (req, res) => {
	// console.log('req.cookies :', req.cookies);
	let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id };

	//res.render('fileName in views folder', {object})
	res.render('urls_index', templateVars); // second argument takes on object
});

app.get('/urls/new', (req, res) => {
	let templateVars = { user_id: req.cookies.user_id };
	res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
	const templateVars = {
		user_id: req.cookies.user_id,
		error: false,
	};
	res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
	const id = generateNewID(); // change to uuid --> require uuid.v4
	const { email, password } = req.body;

	// what happens if you try to register without an email or a password?
	if (!email || !password) {
		const templateVars = {
			user_id: '',
			message: ERROR_MESSAGE.no_email_and_password,
			error: true,
		};
		res.cookie('error', true);
		res.cookie('message', ERROR_MESSAGE.no_email_and_password);
		res.cookie('user_id', ''); //check with mentor?
		res.status(400);
		return res.render('urls_register', templateVars);
	}

	// check if email already exist -error msg enter new email
	else if (doesNewEmailExist(email)) {
		const templateVars = {
			user_id: '',
			message: ERROR_MESSAGE.issue_with_email_password,
			error: true,
		};
		res.cookie('error', true);
		res.cookie('message', ERROR_MESSAGE.no_email_and_password);
		res.cookie('user_id', '');
		res.status(400);
		return res.render('urls_register', templateVars); // render or redirect???
	} else {
		users[id] = { id, email, password };
		console.log(users);
		res.cookie('user_id', email);
		res.redirect('/urls');
	}
});

app.get('/login', (req, res) => {
	const templateVars = { user_id: req.cookies.user_id, error: false };
	console.log(users);
	res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
	// res.cookie('username', req.body.username);
	const { email, password } = req.body;

	if (!email || !password) {
		const templateVars = {
			user_id: '',
			message: ERROR_MESSAGE.no_email_and_password,
			error: true,
		};
		res.cookie('error', true);
		res.cookie('message', ERROR_MESSAGE.no_email_and_password);
		res.cookie('user_id', '');
		res.status(403);
		return res.render('urls_login', templateVars);
	} else if (doesNewEmailExist(email) && !validatePassword(email, password)) {
		const templateVars = {
			user_id: '',
			message: ERROR_MESSAGE.issue_with_email_password,
			error: true,
		};

		res.cookie('error', true);
		res.cookie('message', ERROR_MESSAGE.issue_with_email_password);
		res.cookie('user_id', '');
		res.status(403);
		return res.render('urls_login', templateVars);
	} else {
		res.cookie('user_id', email);
		res.redirect('/urls');
	}
});

app.post('/urls/logout', (req, res) => {
	// another way to clear cookie
	// res.clearCookie('user_id');
	res.cookie('user_id', '');

	res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
	let templateVars = {
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL],
		username: req.cookies.user_id,
	};
	res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
	const shortURL = generateRandomString();
	urlDatabase[shortURL] = req.body.longURL;
	console.log(urlDatabase);
	// res.send('Ok');
	res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
	console.log('entry was deleted');
	const shortURL = req.params.shortURL;

	delete urlDatabase[shortURL];
	res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
	// get the input from text input
	const longURL = req.body.newLongURLinputText;
	urlDatabase[req.params.shortURL] = req.body.newLongURLinputText;
	console.log('urlDatabase:', urlDatabase);
	console.log('entry was updated');
	res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
	const longURL = urlDatabase[req.params.shortURL];
	res.redirect(longURL);
});
// app.get('/set', (req, res) => {
// 	const a = 1;
// 	res.send(`a = ${a}`);
// });
/* 
a is not accessible in the other function/cb. The user will NOT see 'a' set to 1 in '/fetch/
In fact, 'a' is not defined in this scope, and will result in a reference error when anyone visits that URL
*/
// app.get('/fetch', (req, res) => {
// 	res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}!`);
});

// <br />
// <div class="alert alert-danger" style="width: 300px" role="alert"><%= message %></div>

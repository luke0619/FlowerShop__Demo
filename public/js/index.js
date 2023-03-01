/* eslint-disable */
import '@babel/polyfill';
// import { displayMap } from './mapbox.js';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookProduct } from './stripe';
import { signup } from './signup';
import { forgot } from './forgot';
import { reset } from './reset';

// DOM ELEMENTS
// const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-product');
const signupForm = document.querySelector('.Sign');
const forgotForm = document.querySelector('.forgot-form');
const resetForm = document.querySelector('.form--reset');

// DELEGATION

// if (mapBox) {
//     const locations = JSON.parse(mapbox.dataset.locations);
//     displayMap(locations);
// }

if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const token = document.getElementById('token').value;

        reset(password, passwordConfirm, token);
    })
}

if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;

        forgot(email);
    })
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordconfirm').value;
        const data = {
            name,
            email,
            address,
            password,
            passwordConfirm
        };
        signup(data);
    });
};

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        // const email = document.getElementById('email').value;
        // const name = document.getElementById('name').value;
        updateSettings(form, 'data');
    })
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...'

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

        document.querySelector('.btn--save-password').textContent = '儲存密碼';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { productId } = e.target.dataset;
        bookProduct(productId);
    })
}
/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (data) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'api/v1/users/signup',
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                passwordConfirm: data.passwordConfirm,
                address: data.address
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', '註冊成功(載入使用者頁面中...)');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);

        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }
}
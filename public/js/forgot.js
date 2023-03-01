/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const forgot = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', '補救密碼成功(載入使用者頁面中...)');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }
}
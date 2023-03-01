/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const reset = async (password, passwordConfirm, token) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/resetPassword/${token}`,
            data: {
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', '重設密碼成功(載入使用者頁面中...)');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);

        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}
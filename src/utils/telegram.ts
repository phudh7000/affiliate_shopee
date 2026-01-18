import axios from "axios";
const TELE_TOKEN = "7563766748:AAGHe5cNFy5eb1hTdAoUYOFkDGr1tn_qV-8"; 
const CHAT_ID = "-4753873769"; 
const URL = `https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`;

export async function sendMessage(text: string, parse_mode = 'MarkdownV2') {
  try {
    const { data } = await axios.post(URL, {
      chat_id: CHAT_ID,
      text,
      parse_mode
    });
    if (!data.ok) throw new Error(JSON.stringify(data));
    console.log(data)
    return data;
  } catch (err) {
    throw err;
  }
}



// // Sử dụng
// sendMessage("*Hello* Telegram _MarkdownV2_\n I'am Phu ")
//   .then(r => console.log('OK', r.result.message_id))
//   .catch(e => console.error('ERR', e.response?.data || e.message));
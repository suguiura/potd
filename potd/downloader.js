
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

const baseURL = 'https://api.wikimedia.org/feed/v1/wikipedia/en/featured';
const userAgent = 'potd-bot/0.1 (https://suguiura.dev/; contact@suguiura.dev) soup/3.0';
const priority = GLib.PRIORITY_DEFAULT;
const decoder = new TextDecoder();

export default class Downloader {

    #session;

    constructor () {
        this.#session = new Soup.Session();
        Object.freeze(this);
    }

    async download (year, month, day) {
        const apiBytes = await this.#get(`${baseURL}/${year}/${month}/${day}`);
        const text = decoder.decode(apiBytes.get_data());

        return await this.#get(JSON.parse(text).image.image.source);
    }

    async #get (uri) {
        const message = Soup.Message.new('GET', uri);
        message.request_headers.replace('user-agent', userAgent);

        return new Promise((resolve, reject) => this.#session.send_and_read_async(
            message,
            priority,
            null,
            (session, result) => {
                try {
                    resolve(session.send_and_read_finish(result));
                } catch (e) {
                    reject(e);
                }
            }
        ));
    }

    destroy () {
        this.#session.abort();
    }

}

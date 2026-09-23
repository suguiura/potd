
import Gio from 'gi://Gio';

import Filesystem from './filesystem.js';

export default class Settings {

    #filesystem;

    constructor () {
        this.#filesystem = new Filesystem();
        Object.freeze(this);
    }

    #uri (filename) {
        const path = this.#filesystem.path(filename);
        return Gio.File.new_for_path(path).get_uri();
    }

    setBackground (filename) {
        const settings = new Gio.Settings({schema: 'org.gnome.desktop.background'});
        const uri = this.#uri(filename);

        settings.set_string('picture-uri', uri);
        settings.set_string('picture-uri-dark', uri);
    }

}

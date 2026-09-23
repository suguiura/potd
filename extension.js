/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import Downloader from './potd/downloader.js';
import Filesystem from './potd/filesystem.js';
import Settings from './potd/settings.js';


export default class PotdExtension extends Extension {

    #downloader;
    #settings;
    #filesystem;

    constructor (metadata) {
        super(metadata);
        this.#downloader = new Downloader();
        this.#settings = new Settings();
        this.#filesystem = new Filesystem();
        Object.freeze(this);
    }

    enable () {
        const now = new Date();

        this.#run(
              String(now.getFullYear())
            , String(now.getMonth() + 1).padStart(2, '0')
            , String(now.getDate()).padStart(2, '0')
        ).catch(error => console.warn('potd', 'error', error));

        console.log('potd', 'enabled');
    }

    async #run (year, month, day) {
        const filename = `${year}-${month}-${day}-wikimedia.image`;
        const path = this.#filesystem.path(filename);

        if (this.#filesystem.exists(filename)) {
            console.log('potd', 'exists:', path);
        } else {
            const bytes = await this.#downloader.download(year, month, day);
            this.#filesystem.write(filename, bytes.get_data());
            console.log('potd', 'downloaded:', path);
        }

        this.#settings.setBackground(filename);
        console.log('potd', 'set:', path);
    }

    disable () {
        this.#downloader.destroy();
        console.log('potd', 'disabled');
    }

}

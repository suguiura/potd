
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const xdgDataHome = GLib.getenv('XDG_DATA_HOME') || GLib.build_filenamev([GLib.get_home_dir(), '.local', 'share']);

export default class Filesystem {

    constructor () {
        Object.freeze(this);
    }

    path (filename) {
        return GLib.build_filenamev([xdgDataHome, 'dev.suguiura.potd', filename]);
    }

    exists (filename) {
        const path = this.path(filename);
        return GLib.file_test(path, GLib.FileTest.EXISTS);
    }

    write (filename, bytes) {
        const path = this.path(filename);
        GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
        Gio.File.new_for_path(path).replace_contents(bytes, null, false, Gio.FileCreateFlags.NONE, null);
    }

}

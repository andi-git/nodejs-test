export class IntegrationtestConfig {

    public static port(): string {
        return this.getFileContent(__dirname + '/../../../../test/integrationtest/conf/integrationtest.port', '9000');
    }

    public static host(): string {
        return this.getFileContent(__dirname + '/../../../../test/integrationtest/conf/integrationtest.host', 'localhost');
    }

    public static version(): string {
        return this.getFileContent(__dirname + '/../../../../test/integrationtest/conf/integrationtest.version', '0.0.3');
    }

    public static pathPrefix(): string {
        return 'http://'
            + IntegrationtestConfig.host()
            + ':'
            + IntegrationtestConfig.port()
            + '/elleho/'
            + IntegrationtestConfig.version();
    }

    private static getFileContent(file: string, defaultValue: string): string {
        let value: string = defaultValue;
        var fs = require('fs');
        if (fs.existsSync(file) === true) {
            value = fs.readFileSync(file, 'utf-8');
        }
        return value;
    }
}
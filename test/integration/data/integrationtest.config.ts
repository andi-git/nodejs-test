export class IntegrationtestConfig {

    public static port(): string {
        return this.getProperty('port', '9000');
    }

    public static host(): string {
        return this.getProperty('host', 'localhost');
    }

    public static version(): string {
        return this.getProperty('version', '0.1.0');
    }

    public static pathPrefixWithHostAndUrl(): string {
        return 'http://'
            + IntegrationtestConfig.host()
            + ':'
            + IntegrationtestConfig.port()
            + '/elleho/'
            + IntegrationtestConfig.version();
    }

    public static pathPrefix(): string {
        return '/elleho/' + IntegrationtestConfig.version();
    }

    private static getProperty(key: string, defaultValue: string): string {
        let PropertiesReader = require('properties-reader');
        let properties = PropertiesReader(__dirname + '/../../../../test/integration/data/integrationtest.properties');
        let value = properties.get(key);
        if (value) {
            return value;
        } else {
            return defaultValue;
        }
    }
}
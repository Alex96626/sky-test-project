type Config = {
    port: number;
    nodeEnv: string;
};

const config: Config = { 
    port: 3000,
    nodeEnv: 'development'
};

export { config }
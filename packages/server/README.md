<!-- markdownlint-disable MD030 -->

# Flowise - Low-Code LLM apps builder

English | [中文](./README-ZH.md)

![Flowise](https://github.com/FlowiseAI/Flowise/blob/main/images/flowise.gif?raw=true)

Drag & drop UI to build your customized LLM flow

## ⚡Quick Start

1. Install Flowise
    ```bash
    npm install -g flowise
    ```
2. Start Flowise

    ```bash
    npx flowise start
    ```

3. Open [http://localhost:3000](http://localhost:3000)

## 🔒 Authentication

To enable app level authentication, add `FLOWISE_USERNAME` and `FLOWISE_PASSWORD` to the `.env` file:

```
FLOWISE_USERNAME=user
FLOWISE_PASSWORD=1234
```

## 🌱 Env Variables

Flowise support different environment variables to configure your instance. You can specify the following variables in the `.env` file inside `packages/server` folder. Read [more](https://github.com/FlowiseAI/Flowise/blob/main/CONTRIBUTING.md#-env-variables)

You can also specify the env variables when using `npx`. For example:

```
npx flowise start --PORT=3000 --DEBUG=true
```

## 📖 Documentation

[Flowise Docs](https://toolz.ai/)

## 🌐 Self Host

### [Railway](https://toolz.ai/deployment/railway)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YK7J0v)

### [Render](https://toolz.ai/deployment/render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://toolz.ai/deployment/render)

### [AWS](https://toolz.ai/deployment/aws)

### [Azure](https://toolz.ai/deployment/azure)

### [DigitalOcean](https://toolz.ai/deployment/digital-ocean)

### [GCP](https://toolz.ai/deployment/gcp)

## 💻 Cloud Hosted

Coming Soon

## 🙋 Support

Feel free to ask any questions, raise problems, and request new features in [discussion](https://github.com/FlowiseAI/Flowise/discussions)

## 🙌 Contributing

See [contributing guide](https://github.com/FlowiseAI/Flowise/blob/master/CONTRIBUTING.md). Reach out to us at [Discord](https://discord.gg/jbaHfsRVBW) if you have any questions or issues.

## 📄 License

Source code in this repository is made available under the [Apache License Version 2.0](https://github.com/FlowiseAI/Flowise/blob/master/LICENSE.md).

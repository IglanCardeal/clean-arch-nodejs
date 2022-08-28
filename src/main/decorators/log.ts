import {
  Controller,
  HttpRequest,
  HttpResponse,
  LogDataResponse,
  LogRepository,
  UUIDGenerator
} from '@src/presentation/protocols'

export class LogControllerDecorator implements Controller {
  constructor(
    private readonly controller: Controller,
    private readonly logRepository: LogRepository,
    private readonly uuid: UUIDGenerator
  ) {}

  async handle(
    httRequest: HttpRequest
  ): Promise<HttpResponse & LogDataResponse> {
    const transactionId = this.uuid.generate()

    this.logRepository.logInfo({
      ...httRequest,
      transactionId
    })

    const httpResponse = await this.controller.handle(httRequest)

    if (httpResponse.statusCode === 500) {
      await this.logRepository.logError({
        ...httRequest,
        stack: httpResponse.body.stack,
        transactionId
      })
    }

    this.logRepository.logInfo({
      ...httpResponse,
      transactionId
    })

    return { ...httpResponse, transactionId }
  }
}

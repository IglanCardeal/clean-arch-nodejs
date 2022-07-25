import { InvalidParamError, MissingParamError } from '@src/presentation/errors'
import { badRequest } from '@src/presentation/helpers/http-helper'
import { LoginController } from './login-controller'
import { EmailValidator, AuthenticationUseCase } from './login-protocols'

class EmailValidatorStub implements EmailValidator {
  isValid(_email: string): boolean {
    return true
  }
}

class AuthenticationUseCaseStub implements AuthenticationUseCase<string> {
  async auth({ _email, _password }: any): Promise<string> {
    return 'auth_token'
  }
}

const authenticationUseCaseStub = new AuthenticationUseCaseStub()
const emailValidatorStub = new EmailValidatorStub()
const makeSut = () =>
  new LoginController(emailValidatorStub, authenticationUseCaseStub)

describe('Login Controller', () => {
  const httRequest = {
    body: {
      email: 'any@mail.com',
      password: 'any_pass'
    }
  }

  it('Should return 400 if no email is provided', async () => {
    const sut = makeSut()
    const invalidHttpRequest = {
      body: { ...httRequest.body, email: '' }
    }
    const HttpResponse = await sut.handle(invalidHttpRequest)
    expect(HttpResponse).toEqual(badRequest(new MissingParamError('email')))
  })

  it('Should return 400 if no password is provided', async () => {
    const sut = makeSut()
    const invalidHttpRequest = {
      body: { ...httRequest.body, password: '' }
    }
    const HttpResponse = await sut.handle(invalidHttpRequest)
    expect(HttpResponse).toEqual(badRequest(new MissingParamError('password')))
  })

  it('Should call EmailValidator with correct value', async () => {
    const sut = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    await sut.handle(httRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any@mail.com')
  })

  it('Should return 400 if email is invalid', async () => {
    const sut = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const HttpResponse = await sut.handle(httRequest)
    expect(HttpResponse).toEqual(badRequest(new InvalidParamError('email')))
  })

  it('Should call Authentication with correct values', async () => {
    const sut = makeSut()
    const authSpy = jest.spyOn(authenticationUseCaseStub, 'auth')
    await sut.handle(httRequest)
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any@mail.com',
      password: 'any_pass'
    })
  })
})
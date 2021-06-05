import { jokes } from './jokes'

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getRandomJoke = () => {
  const randomNumber = getRandomNumber(0, 574)

  if (!jokes[randomNumber]) {
    return jokes[0]
  }
  return jokes[randomNumber]
}
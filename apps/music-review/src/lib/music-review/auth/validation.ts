import type {
  MusicReviewChangeEmailInput,
  MusicReviewChangeNicknameInput,
  MusicReviewChangePasswordInput,
  MusicReviewAuthErrors,
  MusicReviewLoginInput,
  MusicReviewSignupInput,
} from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginInput(input: MusicReviewLoginInput): MusicReviewAuthErrors {
  const errors: MusicReviewAuthErrors = {}

  if (!input.email.trim()) {
    errors.email = 'Enter your email address'
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = 'Invalid email address format'
  }

  if (!input.password) {
    errors.password = 'Enter your password'
  } else if (input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

export function validateSignupInput(input: MusicReviewSignupInput): MusicReviewAuthErrors {
  const errors: MusicReviewAuthErrors = validateLoginInput({
    email: input.email,
    password: input.password,
  })

  if (!input.nickname.trim()) {
    errors.nickname = 'Enter your nickname'
  }

  if (!input.passwordConfirm) {
    errors.passwordConfirm = 'Enter your password confirmation'
  } else if (input.password !== input.passwordConfirm) {
    errors.passwordConfirm = 'Password confirmation does not match'
  }

  return errors
}

export function validateEmailChangeInput(input: MusicReviewChangeEmailInput): MusicReviewAuthErrors {
  const errors: MusicReviewAuthErrors = {}
  const currentEmail = input.currentEmail.trim()
  const newEmail = input.newEmail.trim()
  const newEmailConfirm = input.newEmailConfirm.trim()

  if (!currentEmail) {
    errors.currentEmail = 'Enter your current email address'
  } else if (!EMAIL_RE.test(currentEmail)) {
    errors.currentEmail = 'Invalid current email address format'
  }

  if (!newEmail) {
    errors.newEmail = 'Enter your new email address'
  } else if (!EMAIL_RE.test(newEmail)) {
    errors.newEmail = 'Invalid new email address format'
  }

  if (!newEmailConfirm) {
    errors.newEmailConfirm = 'Enter your new email address confirmation'
  } else if (newEmail !== newEmailConfirm) {
    errors.newEmailConfirm = 'New email address confirmation does not match'
  }

  if (currentEmail && newEmail && currentEmail.toLowerCase() === newEmail.toLowerCase()) {
    errors.newEmail = 'Enter a different email address from the current one'
  }

  return errors
}

export function validatePasswordChangeInput(input: MusicReviewChangePasswordInput): MusicReviewAuthErrors {
  const errors: MusicReviewAuthErrors = {}

  if (!input.currentPassword) {
    errors.currentPassword = 'Enter your current password'
  }

  if (!input.newPassword) {
    errors.newPassword = 'Enter your new password'
  } else if (input.newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters'
  }

  if (!input.newPasswordConfirm) {
    errors.newPasswordConfirm = 'Enter your password confirmation'
  } else if (input.newPassword !== input.newPasswordConfirm) {
    errors.newPasswordConfirm = 'Password confirmation does not match'
  }

  if (input.currentPassword && input.newPassword && input.currentPassword === input.newPassword) {
    errors.newPassword = 'Enter a different password from the current one'
  }

  return errors
}

export function validateNicknameChangeInput(input: MusicReviewChangeNicknameInput): MusicReviewAuthErrors {
  const errors: MusicReviewAuthErrors = {}
  const currentNickname = input.currentNickname.trim()
  const newNickname = input.newNickname.trim()
  const newNicknameConfirm = input.newNicknameConfirm.trim()

  if (!currentNickname) {
    errors.currentNickname = 'Enter your current nickname'
  }

  if (!newNickname) {
    errors.newNickname = 'Enter your new nickname'
  } else if (newNickname.length > 80) {
    errors.newNickname = 'Nickname must be at most 80 characters'
  }

  if (!newNicknameConfirm) {
    errors.newNicknameConfirm = 'Enter your new nickname confirmation'
  } else if (newNickname !== newNicknameConfirm) {
    errors.newNicknameConfirm = 'New nickname confirmation does not match'
  }

  if (currentNickname && newNickname && currentNickname === newNickname) {
    errors.newNickname = 'Enter a different nickname from the current one'
  }

  return errors
}

export function hasAuthErrors(errors: MusicReviewAuthErrors): boolean {
  return Object.keys(errors).length > 0
}

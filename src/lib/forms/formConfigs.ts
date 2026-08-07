import type { LeadFormConfig } from '../../components/forms/LeadForm'

export const CONTACT_FORM_CONFIG: LeadFormConfig = {
  formType: 'contact',
  title: 'Get in touch',
  description: "Tell us a bit about your practice and we'll get back to you within a day.",
  messageLabel: 'Message',
  messagePlaceholder: 'What can we help with?',
  messageRequired: false,
  submitLabel: 'Send message',
}

export const SERVICE_INQUIRY_FORM_CONFIG: LeadFormConfig = {
  formType: 'inquiry',
  title: 'Ask about this service',
  messageLabel: 'What would you like to know?',
  messageRequired: false,
  submitLabel: 'Send inquiry',
}

export const QUOTE_REQUEST_FORM_CONFIG: LeadFormConfig = {
  formType: 'quote',
  title: 'Request a quote',
  description: 'Tell us about your project and we\'ll put together a quote.',
  messageLabel: 'Project details',
  messagePlaceholder: 'What are you looking to build or improve?',
  messageRequired: true,
  submitLabel: 'Request quote',
}

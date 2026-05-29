import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type FormValues = {
  name: string;
  email: string;
  message: string;
  company: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type ContactFormProps = {
  formspreeEndpoint: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  message: "",
  company: "",
};

export default function ContactForm({ formspreeEndpoint }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const successTitleRef = useRef<HTMLHeadingElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showSuccess) {
      successTitleRef.current?.focus();
    }
  }, [showSuccess]);

  function validate(formValues: FormValues): FormErrors {
    const nextErrors: FormErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Enter your name.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formValues.message.trim()) {
      nextErrors.message = "Enter your message.";
    }

    return nextErrors;
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("Please correct the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setStatusMessage("Sending your message...");

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          company: values.company, // honeypot
          _subject: "Surf Contest Atlas inquiry",
        }),
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      setValues(initialValues);
      setErrors({});
      setShowSuccess(true);
      setStatusMessage("Message sent successfully.");
    } catch (error) {
      setSubmitError(
        "Your message could not be sent right now. Please try again in a moment.",
      );
      setStatusMessage("There was a problem sending your message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeSuccessDialog() {
    setShowSuccess(false);
    firstFieldRef.current?.focus();
  }

  return (
    <>
      <form
        className="contact-form"
        onSubmit={handleSubmit}
        noValidate
        aria-describedby="contact-form-status"
      >
        <div
          id="contact-form-status"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {statusMessage}
        </div>

        {submitError ? (
          <div className="form-error-summary" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="form-field">
          <label htmlFor="name">Your Name *</label>
          <input
            ref={firstFieldRef}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={handleChange}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name ? (
            <p id="name-error" className="form-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="email">Your Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={handleChange}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p id="email-error" className="form-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="message">Your Message *</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            value={values.message}
            onChange={handleChange}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message ? (
            <p id="message-error" className="form-error">
              {errors.message}
            </p>
          ) : null}
        </div>

        <div className="form-field form-field--hidden">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-label="Leave this field blank"
            value={values.company}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </form>

      {showSuccess ? (
        <div className="form-dialog-backdrop">
          <div
            className="form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            aria-describedby="contact-success-description"
          >
            <h3 id="contact-success-title" tabIndex={-1} ref={successTitleRef}>
              Message sent
            </h3>
            <p id="contact-success-description">
              Thanks for reaching out. Your message has been sent successfully.
              We will respond within 1-2 business days.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={closeSuccessDialog}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

<?php
declare(strict_types=1);

namespace Sfd;

/**
 * Server-side twin of assets/js/form-utils.js. The browser validates for
 * convenience; this is the check that counts. Error keys match the form field
 * names so the frontend can show each message under its field.
 */
final class Validator
{
    /** @var array<string,string> */
    public array $errors = [];
    /** @var array<string,mixed> */
    public array $clean = [];

    /** @param array<string,mixed> $input */
    public function __construct(private array $input)
    {
    }

    public function text(string $field, string $label, int $max, bool $required = true): self
    {
        $value = $this->raw($field);
        if ($value === '') {
            if ($required) {
                $this->errors[$field] = "{$label} is required.";
            }
            $this->clean[$field] = null;
            return $this;
        }
        if (mb_strlen($value) > $max) {
            $this->errors[$field] = "{$label} is too long.";
            return $this;
        }
        $this->clean[$field] = $value;
        return $this;
    }

    public function email(string $field = 'email'): self
    {
        $value = $this->raw($field);
        if ($value === '' || strlen($value) > 255 || !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Enter a valid email address.';
            return $this;
        }
        $this->clean[$field] = strtolower($value);
        return $this;
    }

    public function phone(): self
    {
        $code = $this->raw('countryCode');
        $number = $this->raw('mobileNumber');
        if (!preg_match('/^\+?\d{1,4}(-\d{1,4})?$/', $code)) {
            $this->errors['countryCode'] = 'Select a country code.';
        } else {
            $this->clean['countryCode'] = $code;
        }
        if (!preg_match('/^\d{10}$/', $number)) {
            $this->errors['mobileNumber'] = 'Enter a valid 10-digit mobile number.';
        } else {
            $this->clean['mobileNumber'] = $number;
        }
        return $this;
    }

    /** Optional website; a bare domain gets https:// (same rule as the browser). */
    public function website(string $field, int $max = 255): self
    {
        $value = $this->raw($field);
        if ($value === '') {
            $this->clean[$field] = null;
            return $this;
        }
        $pattern = '/^(https?:\/\/)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(:\d+)?([\/?#]\S*)?$/i';
        if (strlen($value) > $max || !preg_match($pattern, $value)) {
            $this->errors[$field] = 'Enter a valid website address, e.g. example.com.';
            return $this;
        }
        $this->clean[$field] = preg_match('/^https?:\/\//i', $value) ? $value : "https://{$value}";
        return $this;
    }

    public function consent(): self
    {
        if (($this->input['consent'] ?? false) !== true && ($this->input['consent'] ?? '') !== 'on') {
            $this->errors['consent'] = 'Please confirm before sending.';
        }
        return $this;
    }

    public function ok(): bool
    {
        return $this->errors === [];
    }

    private function raw(string $field): string
    {
        $value = $this->input[$field] ?? '';
        return is_string($value) ? trim($value) : '';
    }

    /** Tracking fields shared by every lead form. @return array<string,?string> */
    public static function tracking(array $input): array
    {
        $out = ['source_page' => null, 'utm_source' => null, 'utm_medium' => null, 'utm_campaign' => null, 'utm_term' => null, 'utm_content' => null];
        $page = $input['sourcePage'] ?? null;
        if (is_string($page) && preg_match('#^/[A-Za-z0-9/_\-.]{0,240}$#', $page)) {
            $out['source_page'] = $page;
        }
        $utm = is_array($input['utm'] ?? null) ? $input['utm'] : [];
        foreach (['source', 'medium', 'campaign', 'term', 'content'] as $key) {
            $value = $utm[$key] ?? null;
            if (is_string($value) && $value !== '') {
                $out["utm_{$key}"] = mb_substr($value, 0, 150);
            }
        }
        return $out;
    }
}

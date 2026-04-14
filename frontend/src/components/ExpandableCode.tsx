import { useId, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

interface ExpandableCodeProps {
  label: string;
  content: string;
}

export function ExpandableCode({ label, content }: ExpandableCodeProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const codeRegionId = useId();
  const toggleId = `${codeRegionId}-toggle`;

  return (
    <div className={open ? 'expandable-code is-open' : 'expandable-code'}>
      <div className="expandable-code__header">
        <span className="expandable-code__label">{label}</span>
        <button
          aria-controls={codeRegionId}
          aria-expanded={open}
          className="expandable-code__toggle"
          id={toggleId}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? t('common.hide') : t('common.show')}
        </button>
      </div>
      {open ? (
        <pre aria-labelledby={toggleId} className="expandable-code__body" id={codeRegionId} role="region">
          <code>{content}</code>
        </pre>
      ) : null}
    </div>
  );
}

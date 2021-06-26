/** @jsx createElement */
/**
 * Icon module exporting a number of svg icons
 *
 * @module app/lib/icon
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * Icon component, not intended to be used alone but rather as parent element to a path.
 *
 * @returns {Element} DOM component as `svg` wrapper
 * @param {object} props  Component properties
 * @param {Element} props.children Nested child path for display
 */
const Icon = ({ children }) => {
  const size = 20;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      class="dib"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size + 3} ${size + 5}`}
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="1.414"
      style="width: 1.5rem; height: 1.5rem; margin: 0"
    >
      {children}
    </svg>
  );
};

/**
 * CopyIcon (ContentCopy) component, excel symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const CopyIcon = () => (
  <Icon>
    <path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
  </Icon>
);

/**
 * ExcelIcon component, excel symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const ExcelIcon = () => (
  <Icon>
    <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-2.38-3.87 2.34-3.8H7.46l-1.3 2.4-.05.08-.04.09-.64-1.28-.66-1.29H2.59l2.27 3.82-2.48 3.85h2.16zM14.25 21v-3H7.5v3zm0-4.5v-3.75H12v3.75zm0-5.25V7.5H12v3.75zm0-5.25V3H7.5v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3Z" />
  </Icon>
);

/**
 * DownloadIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const DownloadIcon = () => (
  <Icon>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </Icon>
);

/**
 * SaveAltIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const SaveAltIcon = () => (
  <Icon>
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
  </Icon>
);

/**
 * CloseIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const CloseIcon = () => (
  // Material icon set
  <Icon>
    <path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </Icon>
);

/**
 * AddIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const AddIcon = () => (
  // Material icon set
  <Icon>
    <path d="M13 11h-2v3H8v2h3v3h2v-3h3v-2h-3zm1-9H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
  </Icon>
);

/**
 * HelpIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const HelpIcon = () => (
  <Icon>
    <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
  </Icon>
);

/**
 * EditIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const EditIcon = () => (
  <Icon>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </Icon>
);

/**
 * DeleteIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const DeleteIcon = () => (
  <Icon>
    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
  </Icon>
);

/**
 * FilterIcon component, download symbol, path borrowed from
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const FilterIcon = () => (
  <Icon>
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
  </Icon>
);

/**
 * MenuIcon component, the 'burger' icon
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const MenuIcon = () => (
  <Icon>
    <path d="M0 0h24v24H0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </Icon>
);

/**
 * CaretUpIcon component
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const CaretUpIcon = () => (
  <Icon>
    <path d="M0 0h24v24H0z" fill="none"/><path d="M7 14l5-5 5 5z"/>
  </Icon>
);

/**
 * CaretDownIcon component
 * {@link https://material.io/icons/|Material Design}. Intended to be wrapped by
 * {@link module:app/lib/icon~Icon|Icon}
 *
 * @returns {Element} DOM component
 */
const CaretDownIcon = () => (
  <Icon>
    <path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/>
  </Icon>
);

export {
  CloseIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  AddIcon,
  ExcelIcon,
  HelpIcon,
  SaveAltIcon,
  FilterIcon,
  MenuIcon,
  CaretUpIcon,
  CaretDownIcon,
};

export const productPricePattern = /^(?:0|[1-9][0-9]{0,9})(?:\.[0-9]{1,2})?$/;
export const defaultPage = 1;
export const defaultPageSize = 20;
export const maxPageSize = 100;

export const defaultSortCol = 'id';
export const defaultSortDirection = 'asc';

export const productSortColumns = {
  id: 'id',
  price: 'price',
  name: 'name',
} as const;

export const productSortDirections = {
  asc: 'ASC',
  desc: 'DESC',
} as const;

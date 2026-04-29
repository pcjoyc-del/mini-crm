/**
 * Mock source tables from ERP Vector export.
 * Intentionally includes mixed cases for planning/confirmation/release/late/overdue analysis.
 */
export const salesOrderHeader = [
  { SO_No: 'SO-2001', SO_date: '2026-04-10', Customer: 'Modern Living', Salename: 'Narin', store_name: 'Bangna Branch', customer_req_date: '2026-04-24' },
  { SO_No: 'SO-2002', SO_date: '2026-04-11', Customer: 'Home Plus', Salename: 'Mali', store_name: 'Rama2 Branch', customer_req_date: '2026-04-26' },
  { SO_No: 'SO-2003', SO_date: '2026-04-12', Customer: 'Nordic Space', Salename: 'Korn', store_name: 'Chiangmai Branch', customer_req_date: '2026-04-30' },
  { SO_No: 'SO-2004', SO_date: '2026-04-13', Customer: 'Urban Habitat', Salename: 'Pim', store_name: 'Ladprao Branch', customer_req_date: '2026-05-02' },
  { SO_No: 'SO-2005', SO_date: '2026-04-14', Customer: 'Tree House', Salename: 'Aof', store_name: 'Ratchapruek Branch', customer_req_date: '2026-05-05' },
  { SO_No: 'SO-2006', SO_date: '2026-04-15', Customer: 'Metro Furniture', Salename: 'May', store_name: 'Khonkaen Branch', customer_req_date: '2026-05-07' }
];

export const salesOrderDetails = [
  // Pending Planning
  { SO_No: 'SO-2001', detail_line_no: 1, cat_name: 'Sofa', type_name: 'L-Shape', mod_name: 'Mia-L', source_name: 'Factory A', col_name: 'Fabric', color_name: 'Grey', qty: 2, planning_req_date: '2026-04-20', is_customer_confirmed: false, production_date: '', planfinish_date: '', finish_date: '' },
  { SO_No: 'SO-2002', detail_line_no: 1, cat_name: 'Sofa', type_name: '2-Seater', mod_name: 'Nora-2S', source_name: 'Factory A', col_name: 'Fabric', color_name: 'Cream', qty: 2, planning_req_date: '2026-04-19', is_customer_confirmed: false, production_date: '', planfinish_date: '2026-04-14', finish_date: '' },
  { SO_No: 'SO-2004', detail_line_no: 1, cat_name: 'Sofa', type_name: 'L-Shape', mod_name: 'Ari-L', source_name: 'Factory C', col_name: 'Fabric', color_name: 'Olive', qty: 3, planning_req_date: '2026-04-28', is_customer_confirmed: false, production_date: '', planfinish_date: '', finish_date: '' },

  // Confirmed
  { SO_No: 'SO-2001', detail_line_no: 2, cat_name: 'Sofa', type_name: '1-Seater', mod_name: 'Mia-1S', source_name: 'Factory A', col_name: 'Leather', color_name: 'Brown', qty: 1, planning_req_date: '2026-04-21', is_customer_confirmed: true, production_date: '', planfinish_date: '', finish_date: '' },
  { SO_No: 'SO-2003', detail_line_no: 1, cat_name: 'Sofa', type_name: 'Corner', mod_name: 'Urban-C', source_name: 'Factory B', col_name: 'Fabric', color_name: 'Navy', qty: 2, planning_req_date: '2026-04-27', is_customer_confirmed: true, production_date: '', planfinish_date: '', finish_date: '' },
  { SO_No: 'SO-2005', detail_line_no: 1, cat_name: 'Sofa', type_name: '3-Seater', mod_name: 'Luna-3S', source_name: 'Factory B', col_name: 'Fabric', color_name: 'Taupe', qty: 2, planning_req_date: '2026-04-30', is_customer_confirmed: true, production_date: '', planfinish_date: '', finish_date: '' },

  // Released
  { SO_No: 'SO-2003', detail_line_no: 2, cat_name: 'Sofa', type_name: 'Recliner', mod_name: 'Zen-R', source_name: 'Factory C', col_name: 'Fabric', color_name: 'Beige', qty: 4, planning_req_date: '2026-04-25', is_customer_confirmed: true, production_date: '2026-04-22', planfinish_date: '2026-04-23', finish_date: '' },
  { SO_No: 'SO-2004', detail_line_no: 2, cat_name: 'Sofa', type_name: 'Corner', mod_name: 'Ari-C', source_name: 'Factory C', col_name: 'Leather', color_name: 'Black', qty: 1, planning_req_date: '2026-04-24', is_customer_confirmed: true, production_date: '2026-04-21', planfinish_date: '2026-04-22', finish_date: '' },
  { SO_No: 'SO-2006', detail_line_no: 1, cat_name: 'Sofa', type_name: '2-Seater', mod_name: 'Metro-2S', source_name: 'Factory A', col_name: 'Fabric', color_name: 'Sky', qty: 3, planning_req_date: '2026-05-02', is_customer_confirmed: true, production_date: '2026-04-29', planfinish_date: '', finish_date: '' },

  // Completed (some late, some on-time)
  { SO_No: 'SO-2002', detail_line_no: 2, cat_name: 'Sofa', type_name: 'Corner', mod_name: 'Urban-C', source_name: 'Factory B', col_name: 'Fabric', color_name: 'Navy', qty: 3, planning_req_date: '2026-04-22', is_customer_confirmed: true, production_date: '2026-04-19', planfinish_date: '2026-04-20', finish_date: '2026-04-23' },
  { SO_No: 'SO-2005', detail_line_no: 2, cat_name: 'Sofa', type_name: 'Daybed', mod_name: 'Luna-D', source_name: 'Factory B', col_name: 'Fabric', color_name: 'Ivory', qty: 1, planning_req_date: '2026-04-29', is_customer_confirmed: true, production_date: '2026-04-24', planfinish_date: '2026-04-27', finish_date: '2026-04-27' },
  { SO_No: 'SO-2006', detail_line_no: 2, cat_name: 'Sofa', type_name: 'L-Shape', mod_name: 'Metro-L', source_name: 'Factory A', col_name: 'Fabric', color_name: 'Charcoal', qty: 2, planning_req_date: '2026-04-30', is_customer_confirmed: true, production_date: '2026-04-25', planfinish_date: '2026-04-28', finish_date: '2026-04-30' },

  // Overdue but unfinished
  { SO_No: 'SO-2005', detail_line_no: 3, cat_name: 'Sofa', type_name: 'Ottoman', mod_name: 'Luna-O', source_name: 'Factory B', col_name: 'Fabric', color_name: 'Taupe', qty: 2, planning_req_date: '2026-04-16', is_customer_confirmed: true, production_date: '', planfinish_date: '2026-04-12', finish_date: '' },
  { SO_No: 'SO-2006', detail_line_no: 3, cat_name: 'Sofa', type_name: '1-Seater', mod_name: 'Metro-1S', source_name: 'Factory A', col_name: 'Leather', color_name: 'Tan', qty: 1, planning_req_date: '2026-04-18', is_customer_confirmed: false, production_date: '', planfinish_date: '2026-04-13', finish_date: '' }
];

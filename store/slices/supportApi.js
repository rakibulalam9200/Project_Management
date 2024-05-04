import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.vidadynamics.com/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['SupportCases', 'SupportCaseTypes'],
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    getSupportCases: builder.query({
      query: (params) => ({
        url: 'support-case',
        params,
      }),
      providesTags: (result, error, arg) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'SupportCases', id })), 'SupportCases']
          : ['SupportCases'],

    }),
    getSupportCase: builder.query({
      query: (id) => `support-case/${id}`,
      providesTags: (id) => [{ type: 'SupportCases', id }],
    }),
    createSupportCase: builder.mutation({
      query: (data) => ({
        url: 'support-case',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupportCases'],
    }),
    updateSupportCase: builder.mutation({
      query: (data, id) => ({
        url: `support-case/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, id) => [{ type: 'SupportCases', id }, 'SupportCases'],
    }),
    closeSupportCase: builder.mutation({
      query: (id) => ({
        url: `support-case-close/${id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, {id}) => [{ type: 'SupportCases', id }],
    }),
    deleteSupportCase: builder.mutation({
      query: (id) => ({
        url: `support-case/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupportCases'],
    }),
    getSupportCaseTypes: builder.query({
      query: () => 'support-case-type',
      providesTags: ['SupportCaseTypes'],
    }),
  }),
})

export const {
  useGetSupportCasesQuery,
  useCreateSupportCaseMutation,
  useGetSupportCaseTypesQuery,
  useCloseSupportCaseMutation,
  useGetSupportCaseQuery,
} = api
export default api

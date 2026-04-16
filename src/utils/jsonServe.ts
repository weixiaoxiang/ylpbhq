export const jsonGet = async (file: any, params?: any) => {
  try {
    const response = await axios.get(`http://localhost:3000/${file}`, {
      params
    })
    return response.data
  } catch (error) {}
}
export const jsonAdd = async (file: any, data: any) => {
  try {
    await axios.post(`http://localhost:3000/${file}`, data)
  } catch (error) {}
}
export const jsonUp = async (file: any, data: any) => {
  try {
    const response = await axios.put(`http://localhost:3000/${file}/${data.id}`, data)
    return response.data
  } catch (error) {}
}
export const jsonDel = async (file: any, id: any) => {
  try {
    await axios.delete(`http://localhost:3000/${file}/${id}`)
  } catch (error) {}
}

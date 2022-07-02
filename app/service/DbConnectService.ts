import { IDbConnectInfo } from '../types'
import { useConnect } from '../hook/useConnect'
import { useQuery } from '../hook/useQuery'
import { Connection } from 'mysql'
import { setCurrentDBLoginInfo } from '../utils'
import { useResult } from '../hook/useResult'

class DbConnectService {
  /**
   * @author lihh
   * @description 进行数据库db链接
   */
  index = async (bodys: IDbConnectInfo) => {
    let dbClose
    const [successResult, errorResult] = useResult()
    try {
      const [open, close] = useConnect<Connection>(bodys)
      dbClose = close
      const connection = await open()

      // 保存用户登录信息
      setCurrentDBLoginInfo(bodys)
      // 查询数据
      const [query] = useQuery<{ tableName: string }[]>(connection)
      const result = await query(`SELECT tab.TABLE_NAME tableName FROM information_schema.TABLES tab WHERE TABLE_SCHEMA = '${bodys.database}'`)
      return successResult<{ tableName: string }[]>(result)
    } catch (err) {
      return errorResult(err)
    } finally {
      dbClose()
    }
  }
}

export default new DbConnectService()

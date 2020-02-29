/* eslint-disable no-unused-vars */
import { regionData } from 'element-china-area-data'

let regionList = []
let itemId = 0
const region = {
  id: '',
  pid: '',
  name: '',
  code: '',
  level: '',
  createdBy: '1',
  createdDate: '2020-02-28 10:23:10',
  lastModifiedBy: null,
  lastModifiedDate: null
}

function transformToRelationalDB() {
  regionList = []
  itemId = 0
  treeToList(regionData, null, 1)
  console.log(regionList)
  transformToSQL()
}

function transformToSQL() {
  let sql = ''
  regionList.forEach(item => {
    sql += `INSERT INTO \`sys_region\`(\`id\`, \`pid\`, \`name\`, \`code\`, \`level\`, \`created_by\`, \`created_date\`, \`last_modified_by\`, \`last_modified_date\`) VALUES (${item.id}, ${item.pid}, '${item.name}', '${item.code}', ${item.level}, null, null, null, null);\n`
  })
  console.log(sql)
}

function treeToList(tree, pid, level) {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i]
    if (item.value) {
      ++itemId
      regionList.push({
        id: itemId,
        pid: pid,
        name: item.label,
        code: item.value,
        level: level,
        createBy: '1',
        createdDate: '2020-02-28 10:24:31',
        lastModifiedBy: null,
        lastModifiedDate: null
      })
      if (item.children && item.children.length > 0) {
        treeToList(item.children, itemId, level + 1)
      }
    }
  }
}


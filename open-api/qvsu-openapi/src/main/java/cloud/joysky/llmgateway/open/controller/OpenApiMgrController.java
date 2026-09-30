package cloud.joysky.llmgateway.open.controller;

import cloud.joysky.llmgateway.common.annotation.Log;
import cloud.joysky.llmgateway.common.core.controller.BaseController;
import cloud.joysky.llmgateway.common.core.domain.AjaxResult;
import cloud.joysky.llmgateway.common.core.page.TableDataInfo;
import cloud.joysky.llmgateway.common.enums.BusinessType;
import cloud.joysky.llmgateway.open.doc.ApiDocService;
import cloud.joysky.llmgateway.open.domain.OpenApi;
import cloud.joysky.llmgateway.open.service.OpenManageService;
import java.util.List;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RequestMapping("/admin/open/api")
public class OpenApiMgrController extends BaseController
{
    private static final Logger log = LoggerFactory.getLogger(OpenApiMgrController.class);

    private final OpenManageService openManageService;

    private final ApiDocService apiDocService;

    public OpenApiMgrController(OpenManageService openManageService, ApiDocService apiDocService)
    {
        this.openManageService = openManageService;
        this.apiDocService = apiDocService;
    }

    @GetMapping()
    public String api()
    {
        return "open/api/index";
    }

    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(OpenApi api, HttpServletRequest request)
    {
        startPage();
        List<OpenApi> list = openManageService.selectApiList(api);
        return getDataTable(list);
    }

    @GetMapping("/curl/{id}")
    @ResponseBody
    public AjaxResult curl(@PathVariable("id") Long id, HttpServletRequest request)
    {
        OpenApi api = openManageService.selectApiById(id);
        if (api == null)
        {
            log.warn("[OpenAPI] 查询cURL示例失败，接口不存在: id={}", id);
            return AjaxResult.error("接口不存在");
        }
        return AjaxResult.success("操作成功", apiDocService.buildCurlExample(api, resolveBaseUrl(request)));
    }

    @GetMapping("/add")
    public String add()
    {
        return "open/api/add";
    }

    @Log(title = "Open接口", businessType = BusinessType.INSERT)
    @PostMapping("/add")
    @ResponseBody
    public AjaxResult addSave(OpenApi api)
    {
        log.info("[OpenAPI] 新增接口请求: apiName={}, apiPath={}", api.getApiName(), api.getApiPath());
        return toAjax(openManageService.insertApi(api));
    }

    @GetMapping("/edit/{id}")
    public String edit(@PathVariable("id") Long id, ModelMap mmap)
    {
        mmap.put("api", openManageService.selectApiById(id));
        return "open/api/edit";
    }

    @Log(title = "Open接口", businessType = BusinessType.UPDATE)
    @PostMapping("/edit")
    @ResponseBody
    public AjaxResult editSave(OpenApi api)
    {
        log.info("[OpenAPI] 修改接口请求: sId={}, apiName={}", api.getsId(), api.getApiName());
        return toAjax(openManageService.updateApi(api));
    }

    @Log(title = "Open接口", businessType = BusinessType.DELETE)
    @PostMapping("/remove")
    @ResponseBody
    public AjaxResult remove(String ids)
    {
        log.info("[OpenAPI] 删除接口请求: ids={}", ids);
        return toAjax(openManageService.deleteApiByIds(ids));
    }

    private String resolveBaseUrl(HttpServletRequest request)
    {
        String scheme = Optional.ofNullable(request.getHeader("X-Forwarded-Proto")).orElse(request.getScheme());
        String host = Optional.ofNullable(request.getHeader("X-Forwarded-Host")).orElse(request.getServerName());
        String port = Optional.ofNullable(request.getHeader("X-Forwarded-Port"))
                .filter(value -> !host.contains(":"))
                .map(value -> ":" + value)
                .orElseGet(() -> isDefaultPort(request) ? "" : ":" + request.getServerPort());
        return scheme + "://" + host + port + Optional.ofNullable(request.getContextPath()).orElse("");
    }

    private boolean isDefaultPort(HttpServletRequest request)
    {
        return ("http".equalsIgnoreCase(request.getScheme()) && request.getServerPort() == 80)
                || ("https".equalsIgnoreCase(request.getScheme()) && request.getServerPort() == 443);
    }
}

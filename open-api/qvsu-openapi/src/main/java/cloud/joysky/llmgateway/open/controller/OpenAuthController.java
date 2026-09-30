package cloud.joysky.llmgateway.open.controller;

import cloud.joysky.llmgateway.common.core.controller.BaseController;
import cloud.joysky.llmgateway.common.core.domain.AjaxResult;
import cloud.joysky.llmgateway.open.service.OpenManageService;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/admin/open/auth")
public class OpenAuthController extends BaseController
{
    private static final Logger log = LoggerFactory.getLogger(OpenAuthController.class);

    private final OpenManageService openManageService;

    public OpenAuthController(OpenManageService openManageService)
    {
        this.openManageService = openManageService;
    }

    @GetMapping()
    public String page()
    {
        return "open/auth/index";
    }

    @GetMapping("/apps")
    @ResponseBody
    public AjaxResult apps()
    {
        return AjaxResult.success(openManageService.listAppOptions());
    }

    @GetMapping("/apis")
    @ResponseBody
    public AjaxResult apis()
    {
        return AjaxResult.success(openManageService.listApiOptions());
    }

    @GetMapping("/apiIds")
    @ResponseBody
    public AjaxResult apiIds(Long appId)
    {
        log.debug("[OpenAPI] 查询已授权接口: appId={}", appId);
        return AjaxResult.success(openManageService.listAuthorizedApiIds(appId));
    }

    @PostMapping("/save")
    @ResponseBody
    public AjaxResult save(Long appId, Long[] apiIds)
    {
        log.info("[OpenAPI] 保存授权请求: appId={}, apiCount={}", appId, apiIds == null ? 0 : apiIds.length);
        List<Long> list = apiIds == null ? Collections.<Long>emptyList() : Arrays.asList(apiIds);
        openManageService.saveAppAuth(appId, list);
        return success();
    }
}
